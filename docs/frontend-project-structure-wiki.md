# Frontend Project Structure Wiki

## Mục đích tài liệu

Tài liệu này mô tả cấu trúc thư mục của dự án frontend `the-gunners-fe`, giải thích vai trò của từng phần và quy ước sử dụng để các dev khác có thể đọc, onboard, và mở rộng hệ thống dễ dàng.

Dự án hiện tại được xây dựng theo stack:

- Vue 3
- TypeScript
- Vue Router
- Pinia
- Axios

Mục tiêu của cấu trúc này là:

- dễ đọc
- dễ scale
- tách biệt rõ trách nhiệm
- hạn chế viết logic lẫn lộn giữa view, store và API
- thuận tiện cho phase sau như warehouse, product, inventory, order

---

# Cấu trúc tổng quan

```bash
src/
├── api/
│   ├── auth.api.ts
│   └── user.api.ts
│
├── assets/
│   └── styles/
│       ├── main.css
│       └── variables.css
│
├── components/
│   ├── common/
│   │   ├── AppButton.vue
│   │   ├── AppInput.vue
│   │   ├── AppTable.vue
│   │   └── AppPagination.vue
│   │
│   └── layout/
│       ├── AppHeader.vue
│       ├── AppSidebar.vue
│       └── AppBreadcrumb.vue
│
├── constants/
│   ├── route-name.ts
│   ├── role.ts
│   └── status.ts
│
├── layouts/
│   ├── AuthLayout.vue
│   └── AdminLayout.vue
│
├── router/
│   ├── index.ts
│   └── guards.ts
│
├── stores/
│   ├── auth.store.ts
│   └── user.store.ts
│
├── types/
│   ├── api.ts
│   ├── auth.ts
│   ├── router.ts
│   └── user.ts
│
├── utils/
│   ├── axios.ts
│   ├── helpers.ts
│   ├── notify.ts
│   └── storage.ts
│
├── views/
│   ├── auth/
│   │   └── LoginView.vue
│   │
│   └── admin/
│       ├── DashboardView.vue
│       └── users/
│           ├── UserListView.vue
│           ├── UserCreateView.vue
│           └── UserEditView.vue
│
├── App.vue
└── main.ts
```

---

# Nguyên tắc tổ chức

## 1. View không gọi API trực tiếp nếu logic đã đủ lớn
`views/` nên tập trung vào hiển thị giao diện và xử lý tương tác của người dùng.

Nếu một màn hình cần:
- gọi API
- xử lý loading
- xử lý filter
- quản lý state dùng lại nhiều nơi

thì nên đẩy logic sang:
- `stores/`
- `api/`
- `utils/`

## 2. API layer tách riêng khỏi store và view
Mỗi module nghiệp vụ nên có file API riêng.  
Ví dụ:
- auth dùng `auth.api.ts`
- user dùng `user.api.ts`

Điều này giúp:
- dễ đổi endpoint
- dễ test
- không phải viết axios lặp lại ở nhiều nơi

## 3. Types phải đi cùng nghiệp vụ
TypeScript chỉ phát huy hiệu quả khi type được tổ chức rõ ràng.  
Mỗi nhóm dữ liệu nên có file type riêng trong `types/`.

## 4. Layout tách riêng với page
Layout là khung hiển thị chung cho nhiều page, không nên viết lẫn vào từng page.

---

# Giải thích chi tiết từng thư mục

## `src/api/`

Chứa các hàm gọi API đến backend.

### Mục đích
- gom toàn bộ request HTTP vào một nơi
- tránh để component hoặc store viết trực tiếp endpoint
- dễ chỉnh sửa khi backend thay đổi

### File hiện có
- `auth.api.ts`
- `user.api.ts`

### Ví dụ trách nhiệm

#### `auth.api.ts`
Dùng cho:
- login
- logout
- get current profile

#### `user.api.ts`
Dùng cho:
- lấy danh sách user
- lấy chi tiết user
- tạo user
- cập nhật user

### Quy ước
- mỗi hàm API chỉ nên làm một việc
- không xử lý UI trong API layer
- không show toast trong API layer
- chỉ return dữ liệu hoặc Promise

---

## `src/assets/`

Chứa tài nguyên tĩnh của frontend.

### `styles/`
Chứa CSS dùng toàn cục.

#### `main.css`
File CSS chính, thường được import ở `main.ts`.

Dùng cho:
- style global
- reset cơ bản
- font
- body layout
- util class đơn giản nếu cần

#### `variables.css`
Chứa biến CSS như:
- màu chính
- spacing
- radius
- z-index cơ bản

Ví dụ:
```css
:root {
  --color-primary: #409eff;
  --color-danger: #f56c6c;
  --border-radius: 8px;
}
```

### Quy ước
- style dùng riêng cho 1 component nên để trong chính component đó
- style dùng chung toàn hệ thống thì để ở đây

---

## `src/components/`

Chứa các component có thể tái sử dụng.

## `src/components/common/`

Đây là nơi để các component dùng lại ở nhiều màn hình.

### Ví dụ
- `AppButton.vue`
- `AppInput.vue`
- `AppTable.vue`
- `AppPagination.vue`

### Khi nào đưa vào `common/`
Khi component:
- không gắn với 1 page cụ thể
- có thể dùng lại nhiều lần
- mang tính generic

Ví dụ:
- một input chuẩn form
- một table wrapper chuẩn toàn hệ thống
- pagination chuẩn cho list page

### Lợi ích
- thống nhất UI
- giảm lặp code
- dễ đổi style toàn hệ thống

---

## `src/components/layout/`

Chứa component phục vụ khung layout.

### Ví dụ
- `AppHeader.vue`
- `AppSidebar.vue`
- `AppBreadcrumb.vue`

### Mục đích
- tách phần khung admin ra khỏi page
- dễ tái sử dụng ở tất cả page admin
- mỗi layout component chỉ tập trung vào 1 vùng giao diện

### Ví dụ trách nhiệm
- `AppHeader.vue`: top bar, profile, logout
- `AppSidebar.vue`: menu trái
- `AppBreadcrumb.vue`: hiển thị vị trí hiện tại

---

## `src/constants/`

Chứa các hằng số dùng chung trong toàn app.

### File hiện có
- `route-name.ts`
- `role.ts`
- `status.ts`

### Mục đích
Tránh hardcode các string như:
- `"admin"`
- `"active"`
- `"login"`
- `"dashboard"`

### Ví dụ

#### `route-name.ts`
```ts
export const ROUTE_NAME = {
  LOGIN: 'login',
  DASHBOARD: 'dashboard',
  USER_LIST: 'user-list',
}
```

#### `role.ts`
```ts
export const ROLE = {
  ADMIN: 'admin',
  STAFF: 'staff',
}
```

#### `status.ts`
```ts
export const STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
}
```

### Lợi ích
- tránh typo
- dễ refactor
- thống nhất toàn bộ project

---

## `src/layouts/`

Chứa layout cấp trang.

### File hiện có
- `AuthLayout.vue`
- `AdminLayout.vue`

## `AuthLayout.vue`
Dùng cho các màn hình không cần sidebar/header admin.

Ví dụ:
- login
- quên mật khẩu
- reset password

## `AdminLayout.vue`
Dùng cho toàn bộ khu vực sau đăng nhập.

Ví dụ:
- dashboard
- user list
- warehouse
- product
- inventory

### Mục đích
Tách khung admin ra riêng để:
- không lặp code giữa các page
- page chỉ cần lo phần content
- layout chịu trách nhiệm hiển thị header/sidebar

---

## `src/router/`

Chứa cấu hình điều hướng của app.

### File hiện có
- `index.ts`
- `guards.ts`

## `index.ts`
Khai báo toàn bộ route của hệ thống.

Ví dụ:
- `/login`
- `/admin`
- `/admin/users`

Ngoài ra có thể gắn `meta` cho route như:
- `requiresAuth`
- `guestOnly`
- `title`

## `guards.ts`
Chứa logic bảo vệ route.

Ví dụ:
- chưa login mà vào `/admin` thì redirect về `/login`
- đã login mà vào `/login` thì redirect về dashboard

### Mục tiêu
Tách route definition và route guard thành 2 file để code rõ hơn.

---

## `src/stores/`

Chứa Pinia store.

### File hiện có
- `auth.store.ts`
- `user.store.ts`

## `auth.store.ts`
Quản lý state xác thực.

Thường sẽ chứa:
- token
- currentUser
- isAuthenticated
- login()
- logout()
- fetchProfile()

## `user.store.ts`
Quản lý state liên quan tới user.

Thường sẽ chứa:
- danh sách user
- loading
- filter
- pagination
- fetchUsers()

### Quy ước
Store nên quản lý:
- state dùng nhiều component
- state dùng lại nhiều page
- state liên quan business logic

Không nên nhét mọi thứ vào store nếu state chỉ dùng cục bộ cho 1 component nhỏ.

---

## `src/types/`

Chứa type/interface dùng cho TypeScript.

### File hiện có
- `api.ts`
- `auth.ts`
- `router.ts`
- `user.ts`

## `api.ts`
Chứa type chung cho API response.

Ví dụ:
- `ApiResponse<T>`
- `PaginatedResponse<T>`
- `PaginationMeta`

## `auth.ts`
Chứa type cho xác thực.

Ví dụ:
- `LoginPayload`
- `LoginResponse`
- `AuthUser`

## `router.ts`
Chứa type liên quan route meta.

Ví dụ:
- `AppRouteMeta`

## `user.ts`
Chứa type cho user.

Ví dụ:
- `User`
- `UserQueryParams`
- `CreateUserPayload`
- `UpdateUserPayload`

### Lợi ích
- rõ kiểu dữ liệu giữa FE và BE
- ít bug hơn
- autocomplete tốt hơn
- dễ onboarding dev mới

---

## `src/utils/`

Chứa helper và tiện ích dùng chung.

### File hiện có
- `axios.ts`
- `helpers.ts`
- `notify.ts`
- `storage.ts`

## `axios.ts`
Tạo axios instance dùng chung cho toàn app.

Thường chứa:
- baseURL
- timeout
- request interceptor
- response interceptor
- gắn token vào header

## `helpers.ts`
Chứa hàm tiện ích chung.

Ví dụ:
- format date
- debounce
- build query string
- convert status label

## `notify.ts`
Wrap toast/message library để dùng thống nhất.

Ví dụ:
- success message
- error message
- warning message

## `storage.ts`
Wrap thao tác localStorage/sessionStorage.

Ví dụ:
- getToken
- setToken
- removeToken

### Mục đích
Tránh viết đi viết lại logic kỹ thuật ở nhiều nơi.

---

## `src/views/`

Chứa các page thực tế mà user nhìn thấy.

Mỗi file trong `views/` thường tương ứng với một route hoặc một màn hình chính.

## `views/auth/`

### `LoginView.vue`
Màn hình đăng nhập.

Trách nhiệm:
- hiển thị form login
- validate cơ bản
- gọi login action
- redirect sau đăng nhập

## `views/admin/`

### `DashboardView.vue`
Trang tổng quan admin.

Hiện tại có thể chỉ là placeholder, sau này sẽ mở rộng:
- thống kê user
- thống kê kho
- cảnh báo tồn kho
- đơn hàng gần đây

### `views/admin/users/`
Chứa các page liên quan user.

#### `UserListView.vue`
Trang danh sách user.

#### `UserCreateView.vue`
Trang tạo user.

#### `UserEditView.vue`
Trang sửa user.

### Quy ước mở rộng
Khi có module mới, tạo theo pattern tương tự:

```bash
views/admin/products/
views/admin/warehouses/
views/admin/inventories/
```

---

# File gốc của ứng dụng

## `src/main.ts`

Đây là entry point của app.

Thường dùng để:
- tạo app Vue
- import CSS global
- mount Pinia
- mount Router
- mount UI library nếu có

Ví dụ:
```ts
createApp(App).use(createPinia()).use(router).mount('#app')
```

## `src/App.vue`

Đây là root component của ứng dụng.

Thông thường file này sẽ rất mỏng, ví dụ chỉ có:

```vue
<template>
  <RouterView />
</template>
```

Mục tiêu là để router quyết định hiển thị layout hoặc page nào.

---

# Quy ước đặt tên

## Component
Dùng PascalCase:
- `AppHeader.vue`
- `AppSidebar.vue`

## View
Dùng PascalCase và kết thúc bằng `View`:
- `LoginView.vue`
- `UserListView.vue`

## Store
Dùng tên module + `.store.ts`:
- `auth.store.ts`
- `user.store.ts`

## API
Dùng tên module + `.api.ts`:
- `auth.api.ts`
- `user.api.ts`

## Type
Dùng tên domain:
- `auth.ts`
- `user.ts`
- `api.ts`

---

# Luồng dữ liệu khuyến nghị

Khi user thao tác trên màn hình, nên theo flow:

```text
View -> Store -> API -> Backend
```

Ví dụ với màn hình user list:

1. `UserListView.vue` gọi action trong `user.store.ts`
2. `user.store.ts` gọi `user.api.ts`
3. `user.api.ts` dùng axios instance từ `utils/axios.ts`
4. Backend trả dữ liệu
5. Store cập nhật state
6. View render lại

### Lợi ích
- tách trách nhiệm rõ
- dễ debug
- dễ test
- dễ maintain

---

# Quy ước mở rộng module mới

Khi thêm module mới, nên thêm đủ các phần tương ứng nếu cần:

Ví dụ thêm module `product`:

```bash
api/product.api.ts
stores/product.store.ts
types/product.ts
views/admin/products/
```

Nếu module đủ lớn, có thể thêm:
- constants riêng
- components riêng cho module đó

---

# Những điều nên tránh

## 1. Không gọi axios trực tiếp lung tung trong view
Điều này làm code khó đọc và khó tái sử dụng.

## 2. Không hardcode string vai trò, trạng thái, route name
Luôn ưu tiên dùng `constants/`.

## 3. Không nhét toàn bộ state vào một store duy nhất
Mỗi domain nên có store riêng.

## 4. Không để component layout chứa business logic nặng
Sidebar và header chỉ nên xử lý phần khung hiển thị.

## 5. Không để type nằm rải rác khắp project
Ưu tiên gom vào `types/`.

---

# Gợi ý roadmap theo cấu trúc này

## Phase 1
- login
- admin layout
- dashboard placeholder
- user list

## Phase 2
- create/edit user
- role/permission
- filter nâng cao cho user

## Phase 3
- warehouse
- product
- inventory
- order

Cấu trúc hiện tại đủ tốt để đi tiếp các phase này mà không cần đập đi làm lại.

---

# Kết luận

Cấu trúc hiện tại được thiết kế theo hướng:

- tách lớp rõ ràng
- phù hợp với Vue 3 + TypeScript
- thuận tiện cho app admin
- dễ mở rộng cho hệ thống quản lý kho

Nếu dev mới vào dự án, chỉ cần hiểu đúng 4 lớp chính là có thể bắt đầu rất nhanh:

- `views/`: màn hình
- `stores/`: state và business flow
- `api/`: giao tiếp backend
- `types/`: định nghĩa dữ liệu

Từ đó việc thêm module mới sẽ theo cùng một pattern, giúp cả team code đồng nhất hơn.


---

# Environment Configuration (ENV)

## Các file ENV trong project

Ngoài thư mục `src/`, project frontend còn sử dụng các file môi trường (environment) để cấu hình theo từng môi trường chạy.

### Cấu trúc

```bash
.env
.env.development
.env.production
.env.example
```

---

## Mục đích từng file

### `.env.development`
Dùng khi chạy local:

```bash
npm run dev
```

Ví dụ:

```env
VITE_API_URL=http://localhost:8000/api
VITE_APP_NAME=The Gunners FE
```

---

### `.env.production`
Dùng khi build production:

```bash
npm run build
```

Ví dụ:

```env
VITE_API_URL=https://api.yourdomain.com/api
VITE_APP_NAME=The Gunners
```

---

### `.env`
File cấu hình chung (fallback), không bắt buộc.

Ví dụ:

```env
VITE_APP_VERSION=1.0.0
```

---

### `.env.example`
Dùng để chia sẻ cấu hình mẫu cho dev khác.

Ví dụ:

```env
VITE_API_URL=
VITE_APP_NAME=
```

---

## Quy tắc quan trọng của Vite

Tất cả biến môi trường phải bắt đầu bằng:

```bash
VITE_
```

### Ví dụ

❌ Sai:
```env
API_URL=http://localhost:8000/api
```

✅ Đúng:
```env
VITE_API_URL=http://localhost:8000/api
```

---

## Cách sử dụng trong code

```ts
const apiUrl = import.meta.env.VITE_API_URL
```

---

## Ví dụ sử dụng trong axios

```ts
import axios from 'axios'

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
})

export default axiosInstance
```

---

## Lưu ý về bảo mật

File `.env` không nên được commit lên Git.

### `.gitignore`

```bash
.env
.env.*
!.env.example
```

---

## Flow môi trường

| Mode | File sử dụng |
|------|-------------|
| Development | `.env.development` |
| Production | `.env.production` |
| Default | `.env` |

---

## Kết nối với Backend (Laravel Docker)

Nếu backend chạy tại:

```bash
http://localhost:8000
```

Frontend sẽ cấu hình:

```env
VITE_API_URL=http://localhost:8000/api
```

---

## Lưu ý CORS

Backend Laravel cần cho phép frontend truy cập:

```bash
http://localhost:5173
```

---

