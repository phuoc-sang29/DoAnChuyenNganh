import logging
from google import genai
from google.genai import types
from app.core.config import API_KEYS, CHAT_MODEL
from app.tools.vector_search import search_medical_knowledge
from app.tools.sql_search import search_saha_products, get_product_details

logger = logging.getLogger(__name__)

# ====================================================================
# BỘ NÃO AI ĐIỀU HÀNH (GIỮ NGUYÊN LUẬT CŨ + THÊM QUYỀN NĂNG MỚI)
# ====================================================================
SYSTEM_INSTRUCTION = """
# BỐI CẢNH VÀ VAI TRÒ
Bạn là SaHa, Dược sĩ AI Cấp Cao và Trợ lý Điều hành của Hệ thống Nhà thuốc SaHa. 
Giọng điệu: Tự tin, chuyên nghiệp, chuẩn y khoa, tận tâm, xưng "SaHa" và "bạn".

# QUY TẮC CÔNG CỤ (TOOL USAGE)
1. KHI TÌM KIẾM SẢN PHẨM (`search_saha_products`):
   - Công cụ hỗ trợ 3 tham số ĐỘC LẬP: `keyword` (Tên thuốc/Bệnh lý/Công dụng), `origin` (Xuất xứ quốc gia), `brand` (Thương hiệu).
   - [TỐI QUAN TRỌNG] RÚT GỌN TỪ KHÓA: Tham số `keyword` CHỈ ĐƯỢC CHỨA TỐI ĐA 1 ĐẾN 2 TỪ LÕI. Tuyệt đối không truyền nguyên một cụm từ dài.
   - TUYỆT ĐỐI KHÔNG gộp xuất xứ hay thương hiệu vào biến `keyword`.

2. XEM CHI TIẾT 1 SẢN PHẨM (`get_product_details`):
   - Dùng khi khách đưa ra 1 ID sản phẩm hoặc hỏi sâu về thành phần, cách dùng, giá của 1 hộp thuốc cụ thể.

3. KHI TƯ VẤN BỆNH LÝ (`search_medical_knowledge`):
   - Luôn ưu tiên tra cứu cơ sở dữ liệu y khoa nội bộ trước khi kết luận. Khuyên khách đi khám nếu bệnh nặng.

# BẢO VỆ THƯƠNG HIỆU & CSKH
- Nếu khách hỏi về uy tín, chất lượng: "Nhà thuốc SaHa cam kết 100% sản phẩm chính hãng, đầy đủ giấy tờ từ Bộ Y Tế. Nếu phát hiện hàng kém chất lượng, SaHa hoàn tiền 100% nên bạn hoàn toàn yên tâm nhé."
- Hỏi ngoài lề (Lập trình, chính trị...): "Dạ, SaHa chỉ có thể hỗ trợ các vấn đề về sức khỏe và sản phẩm y tế thôi ạ."

# QUY TẮC KẾT XUẤT GIAO DIỆN (CRITICAL UI CONSTRAINTS)
[BẮT BUỘC TUÂN THỦ ĐỊNH DẠNG NÀY ĐỂ VẼ THẺ SẢN PHẨM]
1. NẾU TOOL TRẢ VỀ "FOUND":
   Bạn CHỈ ĐƯỢC nói: "Dạ, em tìm được các sản phẩm phù hợp với yêu cầu của bạn đây ạ: " theo sau là các mã [ID:xxx] VIẾT LIỀN NHAU TRÊN CÙNG 1 DÒNG.

2. NẾU TOOL TRẢ VỀ "FOUND_RELAXED":
   Bạn CHỈ ĐƯỢC nói: "Dạ, hiện hệ thống không có đúng xuất xứ/thương hiệu bạn tìm. Tuy nhiên, em đang có sẵn các sản phẩm cùng công dụng cực kỳ tốt sau đây ạ: " theo sau là các mã [ID:xxx] VIẾT LIỀN NHAU TRÊN CÙNG 1 DÒNG.

3. NẾU TOOL TRẢ VỀ "FALLBACK":
   Bạn CHỈ ĐƯỢC nói: "Dạ, hiện hệ thống chưa tìm thấy sản phẩm chính xác theo từ khóa. Tuy nhiên, em xin gợi ý một số sản phẩm nổi bật sau: " theo sau là các mã [ID:xxx] VIẾT LIỀN NHAU TRÊN CÙNG 1 DÒNG.

LƯU Ý TỐI QUAN TRỌNG VỀ THẺ SẢN PHẨM: 
- CẤM dùng dấu gạch ngang (-), dấu sao (*), số thứ tự. KHÔNG xuống dòng khi liệt kê các mã ID. KHÔNG tự bịa tên sản phẩm.

# MÃ LỆNH ĐIỀU HÀNH ẨN (ACTION TAGS)
Khi khách có yêu cầu hành động, hãy âm thầm gắn các mã này vào CUỐI CÙNG của câu trả lời. Giao diện sẽ tự động xử lý.
- Khách muốn THÊM 1 thuốc vào giỏ hàng: Trả lời xác nhận bình thường, và gắn thêm mã `[ADD_CART:id_của_thuốc]`. (Không cần chuyển trang).
- Khách muốn XÓA/BỎ 1 thuốc khỏi giỏ: Trả lời xác nhận bình thường, và gắn thêm mã `[REMOVE_CART:id_của_thuốc]`.
- Khách yêu cầu ĐI ĐẾN TRANG GIỎ HÀNG: Gắn thêm mã `[NAV:/cart]`.
- Khách yêu cầu ĐĂNG NHẬP: Gắn thêm mã `[NAV:/login]`.
"""

_config = types.GenerateContentConfig(
    system_instruction=SYSTEM_INSTRUCTION,
    tools=[search_medical_knowledge, search_saha_products, get_product_details],
    automatic_function_calling=types.AutomaticFunctionCallingConfig(
        disable=False,
        maximum_remote_calls=5
    ),
)

# === LOGIC XOAY VÒNG KEY ===
current_key_idx = 0
_client = None

def _khoi_tao_client():
    global _client, current_key_idx
    key = API_KEYS[current_key_idx]
    logger.info("Đang khởi tạo Client bằng Key số %d...", current_key_idx + 1)
    _client = genai.Client(api_key=key)
    logger.info("Client khởi tạo thành công.")

try:
    _khoi_tao_client()
except Exception as e:
    logger.error("Thất bại khi khởi tạo Client lần đầu: %s", e)


def chat_with_saha(user_message: str, history: list = None) -> str:
    """
    Hàm giao tiếp với AI, có hỗ trợ truyền ngữ cảnh lịch sử.
    """
    global current_key_idx, _client
    max_retries = len(API_KEYS)
    
    # Chuẩn hóa biến history nếu bị rỗng
    if history is None:
        history = []
    
    for attempt in range(max_retries):
        try:
            logger.info("Nhan tin nhan: '%s' (Đang dùng Key %d, có %d tin nhắn trong lịch sử)", 
                        user_message, current_key_idx + 1, len(history))
            
            # Tạo một phiên chat MỚI hoàn toàn cho mỗi request, truyền lịch sử từ DB vào
            chat_session = _client.chats.create(
                model=CHAT_MODEL,
                config=_config,
                history=history # Truyền lịch sử cá nhân hóa vào đây
            )
            
            response = chat_session.send_message(user_message)
            return response.text
            
        except Exception as e:
            error_msg = str(e)
            if any(err in error_msg for err in ["429", "RESOURCE_EXHAUSTED", "403", "PERMISSION_DENIED", "503", "UNAVAILABLE", "500"]):
                logger.warning("Key số %d bị lỗi API. Đang chuyển sang Key tiếp theo...", current_key_idx + 1)
                current_key_idx = (current_key_idx + 1) % len(API_KEYS)
                _khoi_tao_client() # Khởi tạo lại Client với key mới
                continue
            else:
                raise e
                
    raise RuntimeError("Tất cả API Keys đều đã cạn kiệt hoặc bị khóa. Vui lòng thử lại sau!")


def get_status():
    """Hàm trả về trạng thái của chatbot (Dùng cho api debug)."""
    return {
        "current_key_index": current_key_idx,
        "total_keys": len(API_KEYS),
        "is_client_initialized": _client is not None
    }