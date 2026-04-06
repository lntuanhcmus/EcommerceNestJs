# Tổng quan Kiến trúc Hệ thống (System Architecture) - Cập nhật

Hệ thống được thiết kế theo mô hình **Modular Monolith** kết hợp ứng dụng các tư tưởng kiến trúc hiện đại (CQRS, Event-Driven, Saga Pattern).

## 1. Các Tư tưởng Kiến trúc Chủ đạo

*   **Modular Monolith:** Phân chia rạch ròi hệ thống thành các Module độc lập (`Product`, `Order`, `Inventory`, `Cart`).
*   **CQRS:** Tách biệt luồng Đọc (Queries) và Ghi (Commands).
*   **Workflows / Orchestration:** Sử dụng **Checkout Module** như một "Nhà điều phối" đứng giữa để kết nối các module dữ liệu rời rạc.
*   **Background Jobs (BullMQ):** Xử lý các tác vụ tốn thời gian (Trừ kho vật lý) một cách bất đồng bộ qua Redis.

## 2. Mô hình Kiến trúc Tương tác Tổng thể

```mermaid
graph TD
    Client((Client / Nhóm Frontend))
    
    subgraph Monolith Application
      direction TB
      
      subgraph Checkout Module
        CH_Ctrl[Checkout Controller]
        CH_Handler[Checkout Handler - Orchestrator]
      end

      subgraph Cart Module
        C_Ctrl[Cart Controller]
        C_Cmd[Cart Handlers]
        C_DB[(Cart DB: UUID)]
      end
      
      subgraph Order Module
        O_Cmd[Order Handlers - Saga Instance]
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
    
    Client -->|POST /cart| C_Ctrl
    Client -->|POST /checkout/:id| CH_Ctrl
    
    CH_Ctrl -.-> CH_Handler
    
    CH_Handler -- "1. GetCartQuery" ---> C_Cmd
    CH_Handler -- "2. CreateOrderCommand" ---> O_Cmd
    CH_Handler -- "3. MarkCompletedCommand" ---> C_Cmd
    
    O_Cmd -- "Saga: Reserve Sync" ---> I_Svc
    O_Cmd -- "Publish Event" -.-> EB
    
    EB -- "Job Queue" --> Redis
    Redis -- "Worker (Async Deduct)" --> I_Svc
```

## 3. Quản lý Giao dịch Phân tán (Saga Pattern)

Duy trì tính nhất quán khi dữ liệu bị chia cắt:
*   **Orchestration (Checkout):** Điều phối chuỗi hành động giữa các module.
*   **Compensating Transactions:** Nếu một bước trong chuỗi tạo Order thất bại, hệ thống tự động gọi `releaseInventory` để hoàn trả trạng thái kho ban đầu.
