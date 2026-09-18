# 按享到家前端

这是一个 O2O 上门按摩移动端项目，只包含前端页面和预留接口，不包含服务端、数据库和真实支付。

## 技术栈

- React + React Router
- Vite
- Lucide React 图标
- 原生 CSS 移动端布局

## 快速开始

需要 Node.js 18 或更高版本，推荐 Node.js 20。

```bash
npm install
npm run dev
```

终端会显示本地访问地址，默认通常为 `http://localhost:5173`。

生产构建：

```bash
npm run build
npm run preview
```

构建文件位于 `dist/`。

## 页面路由

| 路由 | 页面 | 说明 |
| --- | --- | --- |
| `/` 或 `/home` | 首页 | 分类、活动和热门服务 |
| `/booking` | 预约 | 日期、时间、服务、按摩师联动选择 |
| `/therapists` | 按摩师 | 筛选和按摩师列表 |
| `/order/:id` | 订单详情 | 订单服务、地址和费用 |
| `/profile` | 我的 | 个人信息和常用功能 |

## 目录说明

```text
src/
├─ api/
│  ├─ client.js       # 统一请求、Token、超时和错误处理
│  ├─ home.js         # 首页接口
│  ├─ booking.js      # 预约与下单接口
│  ├─ therapists.js   # 按摩师接口
│  ├─ orders.js       # 订单接口
│  ├─ user.js         # 用户、地址和优惠券接口
│  └─ index.js        # 统一导出
├─ main.jsx            # 页面、路由与交互
└─ styles.css          # 全局样式
public/assets/              # 本地图片
```

## 接口环境配置

复制 `.env.example` 为 `.env.local`：

```bash
VITE_API_BASE_URL=http://localhost:8080/api
VITE_API_TIMEOUT=10000
VITE_USE_MOCK=true
```

- `VITE_API_BASE_URL`：后端 API 根地址。
- `VITE_API_TIMEOUT`：请求超时时间，单位毫秒。
- `VITE_USE_MOCK`：演示数据开关，当前页面默认使用本地数据。后端完成后可改为 `false` 并将页面数据源切换为 `src/api` 中的方法。

## 统一响应格式

建议后端返回：

```json
{
  "code": 0,
  "message": "success",
  "data": {}
}
```

请求层同时兼容直接返回业务数据。非 2xx、业务 `code` 非 `0/200`、超时或网络异常会统一转换为 `ApiError`。

Token 用法：

```js
import { setToken } from './api';

setToken('accessToken'); // 登录成功
setToken();              // 退出登录
```

有 Token 时请求会自动携带 `Authorization: Bearer <token>`。

## 预留接口清单

### 首页

| 方法 | 路径 | 用途 |
| --- | --- | --- |
| GET | `/home` | 首页聚合数据 |
| GET | `/service-categories` | 服务分类 |
| GET | `/services/popular` | 热门服务分页 |
| GET | `/banners?position=home` | 首页 Banner |

### 预约与下单

| 方法 | 路径 | 用途 |
| --- | --- | --- |
| GET | `/booking/available-dates` | 可预约日期 |
| GET | `/booking/available-times` | 可预约时间 |
| GET | `/services` | 服务列表 |
| GET | `/therapists/available` | 可预约按摩师 |
| POST | `/booking/calculate` | 计算订单价格 |
| POST | `/orders` | 提交订单 |

建议下单请求体：

```json
{
  "date": "2024-03-20",
  "time": "13:00",
  "serviceId": 1,
  "therapistId": 1,
  "addressId": 1,
  "couponId": null,
  "remark": ""
}
```

### 按摩师

| 方法 | 路径 | 用途 |
| --- | --- | --- |
| GET | `/therapists` | 分页与筛选 |
| GET | `/therapists/:id` | 按摩师详情 |
| GET | `/therapists/recommended` | 推荐按摩师 |
| POST/DELETE | `/therapists/:id/follow` | 收藏/取消收藏 |

### 订单

| 方法 | 路径 | 用途 |
| --- | --- | --- |
| GET | `/orders` | 订单分页 |
| GET | `/orders/:id` | 订单详情 |
| POST | `/orders/:id/cancel` | 取消订单 |
| POST | `/orders/:id/reorder` | 再次预约 |

### 用户中心

| 方法 | 路径 | 用途 |
| --- | --- | --- |
| GET/PUT | `/user/profile` | 查询/修改个人资料 |
| GET/POST | `/user/addresses` | 查询/新增地址 |
| PUT/DELETE | `/user/addresses/:id` | 修改/删除地址 |
| GET | `/user/coupons` | 优惠券列表 |

## 调用示例

```js
import { bookingApi, orderApi } from './api';

const times = await bookingApi.getAvailableTimes({
  date: '2024-03-20',
  serviceId: 1,
});

const order = await bookingApi.createOrder({
  date: '2024-03-20',
  time: '13:00',
  serviceId: 1,
  therapistId: 1,
  addressId: 1,
});

const detail = await orderApi.getDetail(order.id);
```

## 联调注意事项

1. 前后端端口不同时，需在后端允许跨域，或在 Vite 配置开发代理。
2. 金额建议后端以“分”为单位存储，避免浮点误差。
3. 日期使用 `YYYY-MM-DD`，时间使用 `HH:mm`，完整时间推荐 ISO 8601。
4. 服务、按摩师及时段是否可预约，必须由服务端二次校验。
5. 创建订单建议支持幂等键，同时在前端防止重复点击。
6. 订单最终金额以后端计算结果为准，不应信任前端传入的价格。

## 素材说明

`public/assets` 中的图片来自当前提供的参考图，仅用于页面还原。正式上线前请替换为拥有明确使用授权的独立原图。

## 交互功能接口补充

本轮新增的页面交互目前均可在纯前端环境中运行。地址和地区使用 `localStorage` 保存；接入登录系统后，应改为用户账户下的服务端数据。

| 功能 | 方法 | 建议接口 |
| --- | --- | --- |
| 城市和行政区选择 | GET | `/regions` |
| 服务分类 | GET | `/service-categories` |
| 领取新人优惠 | POST | `/promotions/new-user/claim` |
| 查询邀请活动 | GET | `/user/invite` |
| 生成邀请链接 | POST | `/user/invite/link` |
| 积分明细 | GET | `/user/points` |
| 会员信息 | GET | `/user/membership` |
| 收藏按摩师 | GET | `/user/favorite-therapists` |
| 评价列表/提交评价 | GET/POST | `/user/reviews` |
| 健康档案 | GET/PUT | `/user/health-profile` |
| 发票列表/申请发票 | GET/POST | `/user/invoices` |
| 用户设置 | GET/PATCH | `/user/settings` |
| 创建客服工单 | POST | `/support/tickets` |

### 地址归属与保存

地址必须归属于当前登录用户。后端根据 Token 确定用户，不接受前端自行传入其他用户 ID。接口沿用：

- `GET /user/addresses`
- `POST /user/addresses`
- `PUT /user/addresses/:id`
- `DELETE /user/addresses/:id`

新增或编辑地址建议字段：

```json
{
  "contactName": "李先生",
  "contactPhone": "13800008888",
  "provinceCode": "110000",
  "cityCode": "110100",
  "districtCode": "110105",
  "detail": "建国路88号 华贸中心1号楼1203室",
  "longitude": 116.475,
  "latitude": 39.915,
  "isDefault": true
}
```

### 外部跳转说明

- 拨打按摩师电话：前端弹出确认层，确认后使用 `tel:`。正式环境中的号码应由订单详情接口返回。
- 高德导航：使用高德 URI API，坐标应由用户地址接口返回，不要在正式环境写死。
- 联系客服：当前支持 `tel:` 和邮件跳转；接入在线客服后，将入口替换为客服系统会话 URL 或创建 `/support/tickets` 工单。
- 邀请好友：分享链接必须由服务端生成带签名的邀请码，前端不自行构造奖励参数。

所有写操作都应校验登录态、资源归属和重复提交，优惠资格、积分、价格及奖励结果以服务端为准。
