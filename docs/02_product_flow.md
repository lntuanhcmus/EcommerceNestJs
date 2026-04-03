# Luồng Nghiệp vụ: Tạo Sản Phẩm (Create Product Flow)

Luồng này áp dụng **Eventual Consistency** (Nhất quán cuối). Việc tạo sản phẩm ở module `Product` được thực hiện đồng bộ trước mắt, còn việc mở và tạo số lượng tồn kho bên module `Inventory` được tách ra, xử lý bất đồng bộ (Asynchronous) thông qua sự kiện.

## 📝 Chi tiết các bước

1. **Client Gửi Yêu Cầu:** Gửi yêu cầu `POST /products` mang theo các Payload (Tên sản phẩm, các Options, Các thuộc tính Dòng Variants).
2. **Controller Nhận Diện:** `Product Controller` tiếp nhận, xác nhận Role, làm sạch Request (Validation Pipe) rồi đóng gói cục ruột vào thành `CreateProductCommand`. Ra lệnh cho `CommandBus`.
3. **Handler Xử Lý Đồng Bộ (Database Chống Lưng):**
   - `CreateProductHandler` chụp lấy Command này.
   - Thao tác Query tạo Product, tạo các Option liên đới, và lưu các Variants vào các Bảng Product tương ứng qua TypeORM Framework.
4. **Phát Tín Hiệu "Đã Ra Đời" (Event Emit):**
   - Không quan tâm nhà màng làm gì, sau khi save DB thành công, Handler ném ra một Loa Phóng Thanh (EventBus) một tín hiệu: 👉 `ProductCreatedEvent`.
   - Ngay lập tức Handlers return vứt lại mã số `HTTP 201 Created` về cho Client (Client kết thúc hành trình, không cần lo âu).
5. **Hậu Trường Cần Mẫn (Async Worker):**
   - Ở Module Inventory/Background, nó đánh hơi thấy tiếng loa `ProductCreatedEvent`.
   - Các Handler Queue lập tức bắt tay vào tạo thẻ kho nội bộ (Bản ghi `InventoryItem` mang SKU của hàng mới tung vào) với mặc định `stockedQuantity = 0`.

## 📊 Biểu đồ tuần tự (Sequence Diagram)


