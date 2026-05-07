# Stage 1: Sử dụng môi trường .NET 10 SDK để Build code
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /app

# Copy file csproj vào trước và tải các thư viện (restore)
COPY *.csproj ./
RUN dotnet restore

# Copy toàn bộ code còn lại và tiến hành đóng gói (publish)
COPY . ./
RUN dotnet publish -c Release -o out

# Stage 2: Sử dụng môi trường .NET 10 Runtime (siêu nhẹ) để chạy
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /app/out .

# Cấu hình cổng mạng (ASP.NET Core mặc định chạy cổng 8080)
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

# Lệnh đánh thức server C# dậy
ENTRYPOINT ["dotnet", "backend-saha.dll"]