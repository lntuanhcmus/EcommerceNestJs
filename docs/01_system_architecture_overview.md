# Tổng quan Kiến trúc Hệ thống (System Architecture)

Hệ thống được thiết kế theo mô hình **Modular Monolith** kết hợp ứng dụng các tư tưởng kiến trúc hiện đại, đảm bảo tính dễ rẽ nhánh, hiệu năng cao và mở đường cho việc scale lên Microservices trong tương lai.

## 1. Các Tư tưởng Kiến trúc Chủ đạo

*   **Modular Monolith:** Phân chia rạch ròi hệ thống thành các Module độc lập (Ví dụ: `Product Module`, `Order Module`, `Inventory Module`). Các module này hạn chế tối đa việc gọi service chéo nhau trực tiếp ngoại trừ một số API dùng chung cốt lõi. Mọi giao tiếp tốt nhất nên qua Event.
*   **CQRS (Command Query Responsibility Segregation):** Tách biệt rạch ròi luồng Đọc dữ liệu (Queries) và luồng Ghi/Sửa/Xóa dữ liệu (Commands).
    *   Mỗi hành động từ người dùng (ví dụ Tạo đơn hàng) được đóng gói thành một `Command` độc lập.
    *   Command được đưa cho `CommandBus` để route đến đúng `Handler` phân tích.
*   **Event-Driven Architecture (EDA):** Tác nhân chính giúp các Module tách rời (decouple). Mỗi khi một Module làm xong việc, nó không gọi các Module khác. Thay vào đó, nó "phóng" ra một Server Event (ví dụ: `OrderCreatedEvent`). Các module quan tâm (ví dụ: `Inventory`) sẽ tự động lắng nghe và làm phần việc của mình.
*   **Background Jobs & Queues (Saga Pattern):** Tích hợp công nghệ Redis và BullMQ để tiếp nhận các hành động tốn thời gian hoặc cần độ chịu lỗi cao (Fault Tolerance). Thay vì block (chặn) Client, hệ thống quăng job vào Hàng chờ (Queue) để các Worker chạy ngầm giải quyết.

## 2. Mô hình Kiến trúc Tương tác Tổng thể

```mermaid
graph TD
    Client((Client / Nhóm Frontend))
    
    subgraph Monolith Application
      direction TB
      subgraph Product Module
        P_Ctrl[Products Controller]
        P_Cmd[Command/Query Handlers]
        P_DB[(Core DB: Postgres)]
      end
      
      subgraph Order Module
        O_Ctrl[Orders Controller]
        O_Cmd[Command/Query Handlers]
        O_DB[(Order DB: Postgres)]
      end
      
      subgraph Inventory Module
        I_Svc[Inventory Service]
        I_DB[(Inventory DB: Postgres)]
      end
    end
    
    subgraph Message Brokers
      EB(EventBus - Kênh Trong Vắt)
      Redis[(Redis / BullMQ - Kênh Bền Vững)]
    end
    
    Client -->|POST /products| P_Ctrl
    Client -->|POST /orders| O_Ctrl
    
    P_Ctrl -.-> P_Cmd
    O_Ctrl -.-> O_Cmd
    
    P_Cmd ==> P_DB
    O_Cmd ==> O_DB
    
    O_Cmd -- "Sụp đổ Dây chuyền: Reserve Sync" ---> I_Svc
    I_Svc <==> I_DB
    
    P_Cmd -- "Publish Event" -.-> EB
    O_Cmd -- "Publish Event" -.-> EB
    
    EB -- "Chuyển tiếp tác vụ rủi ro rớt mạng" --> Redis
    
    Redis -- "Worker Hút Job (Async)" --> I_Svc
```

## 3. Quản lý Giao dịch Phân tán (Distributed Transactions)

Việc hệ thống chia nhỏ Table Storage ra từng Module sinh ra thách thức về tính toàn vẹn (Consistency). Để khắc phục:
*   Mọi thao tác ghi được **Saga Pattern** bảo vệ (cụ thể là *Choreography Saga*).
*   Ví dụ luồng Mua Hàng: Áp dụng cơ chế **Compensating Transaction (Giao dịch Bù đắp)**. Khi một khâu trong mạng lưới Command bị lỗi nửa chừng, ngay lập tức hệ thống kích hoạt hàm Release Invetory nhằm rollback trạng thái về ban đầu (Nhả cọc).
