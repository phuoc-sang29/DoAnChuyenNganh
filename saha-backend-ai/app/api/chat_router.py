import re
import logging
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from app.agent.chatbot import chat_with_saha
from supabase import create_client
from app.core.config import SUPABASE_URL, SUPABASE_KEY

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["Chat"])


class ChatRequest(BaseModel):
    message: str
    user_id: str  # Dòng mới được thêm vào để nhận ID từ React


class ProductCard(BaseModel):
    id: str
    name: str
    price: int


class ChatResponse(BaseModel):
    status: str
    answer: str
    products: Optional[List[ProductCard]] = None


def _parse_products_from_answer(answer: str, supabase_client) -> Optional[List[ProductCard]]:
    """
    Quet chuoi tra loi cua AI tim cac the [ID:xxx].
    Neu tim thay, tra ve danh sach ProductCard.
    Neu khong co, tra ve None.
    """
    ids = re.findall(r"\[ID:([^\]]+)\]", answer)
    if not ids:
        return None

    logger.info("Tim thay %d ID san pham trong cau tra loi cua AI.", len(ids))
    cards = []
    for pid in ids:
        pid = pid.strip()
        try:
            r = supabase_client.table("products").select("id, name, price").eq("id", pid).single().execute()
            if r.data:
                cards.append(ProductCard(
                    id=r.data["id"],
                    name=r.data["name"],
                    price=int(r.data["price"])
                ))
        except Exception as e:
            logger.warning("Khong the lay thong tin san pham id=%s: %s", pid, e)

    return cards if cards else None


@router.post("/chat", response_model=ChatResponse)
async def process_chat(request: ChatRequest):
    user_msg = request.message.strip()
    u_id = request.user_id

    if not user_msg:
        raise HTTPException(status_code=400, detail="Tin nhan khong duoc de trong.")

    try:
        # Khởi tạo Supabase ngay từ đầu để dùng chung cho cả History và Product Parsing
        sb = create_client(SUPABASE_URL, SUPABASE_KEY)

        # 1. LẤY LỊCH SỬ CHAT TỪ SUPABASE
        history_data = sb.table("chat_logs") \
            .select("role, content") \
            .eq("user_id", u_id) \
            .order("created_at", desc=True) \
            .limit(10) \
            .execute()
        
        # Đảo ngược lại để đúng thứ tự thời gian
        # context = [{"role": h['role'], "parts": [h['content']]} for h in reversed(history_data.data)]
        # Đảo ngược lại để đúng thứ tự thời gian, cấu trúc chuẩn cho SDK mới
        context = [{"role": h['role'], "parts": [{"text": h['content']}]} for h in reversed(history_data.data)]
        # 2. GỌI AI AGENT (Truyền thêm context vào để AI nhớ)
        # Lưu ý: Lát nữa bạn mở file app/agent/chatbot.py ra và thêm tham số history vào hàm chat_with_saha nhé
        raw_answer = chat_with_saha(user_msg, history=context)

        # Lam sach the [ID:xxx] khoi cau tra loi hien thi cho nguoi dung
        clean_answer = re.sub(r"\s*\[ID:[^\]]+\]", "", raw_answer).strip()

        # Parse danh sach san pham neu AI co tra ve
        products = _parse_products_from_answer(raw_answer, sb)

        # 3. LƯU TIN NHẮN VÀO SUPABASE
        # Lưu raw_answer để AI lần sau nhớ cả các thẻ ID sản phẩm nó từng gợi ý
        log_data = [
            {"user_id": u_id, "role": "user", "content": user_msg},
            {"user_id": u_id, "role": "model", "content": raw_answer} 
        ]
        sb.table("chat_logs").insert(log_data).execute()

        return ChatResponse(
            status="success",
            answer=clean_answer,
            products=products
        )

    except Exception as e:
        # Day thang loi goc cua Python ra ngoai Frontend de debug
        logger.error("Loi xu ly chat: %s", e, exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))