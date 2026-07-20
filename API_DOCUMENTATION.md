# API Documentation

Base URL (local): `http://localhost:5000/api`

All protected routes require a header:
```
Authorization: Bearer <token>
```
The token is obtained from `POST /api/auth/login`.

---

## Auth

### `POST /api/auth/login`
**Auth required:** No

**Body:**
```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

**Success response — 200:**
```json
{
  "token": "eyJhbGciOi...",
  "user": {
    "id": 1,
    "name": "Admin User",
    "role": "SUPER_ADMIN"
  }
}
```

**Error responses:**
- `401` — `{ "message": "Invalid credentials" }`
- `500` — `{ "message": "Login failed", "error": "..." }`

---

### `POST /api/auth/logout`
**Auth required:** No

**Response — 200:**
```json
{ "message": "Logout successful" }
```
> Note: since auth is stateless JWT, logout is handled client-side by discarding the token. This endpoint exists to satisfy the spec and clears a cookie if one is ever set.

---

## Employees

All routes below require `Authorization: Bearer <token>` (except where noted, none are unauthenticated).

### `GET /api/employees`
**Roles allowed:** `SUPER_ADMIN`, `HR`

**Query params (all optional):**
| Param | Type | Description |
|---|---|---|
| `name` | string | Filter by name (case-insensitive, partial match) |
| `email` | string | Filter by email (case-insensitive, partial match) |
| `department` | number | Filter by department ID |
| `role` | string | Filter by role: `SUPER_ADMIN`, `HR`, `EMPLOYEE` |
| `status` | string | Filter by status: `ACTIVE`, `INACTIVE` |
| `sortBy` | string | `joiningDate` (descending) or omit for name (ascending) |
| `page` | number | Page number, default `1` |
| `limit` | number | Results per page, default `10` |

**Response — 200:**
```json
{
  "data": [ { "id": 2, "name": "...", "email": "...", "department": { "id": 1, "name": "Engineering" }, "...": "..." } ],
  "meta": { "total": 25, "page": 1, "limit": 10, "totalPages": 3 }
}
```

---

### `GET /api/employees/:id`
**Roles allowed:** `SUPER_ADMIN`, `HR`, or the `EMPLOYEE` themself (`req.user.id === :id`)

**Response — 200:** the employee object (with `department` included)
**Response — 403:** if an `EMPLOYEE` requests someone else's ID
**Response — 404:** `{ "message": "Employee not found" }`

---

### `POST /api/employees`
**Roles allowed:** `SUPER_ADMIN`, `HR`

**Body:**
```json
{
  "name": "New Employee",
  "email": "employee@example.com",
  "password": "password123",
  "phone": "9876543210",
  "departmentId": 1,
  "designation": "Developer",
  "salary": 50000,
  "role": "EMPLOYEE",
  "managerId": 2
}
```
`managerId`, `status`, `joiningDate` are optional.

**Response — 201:** created employee (password omitted)
**Response — 400:** validation errors (Zod)

---

### `PUT /api/employees/:id`
**Roles allowed:**
- `SUPER_ADMIN` / `HR`: can update any field on any employee
- `EMPLOYEE`: can only update their own record, and only `phone`, `profileImage`, `password`

**Body:** any subset of the create fields (all optional/partial)

**Response — 200:** updated employee (password omitted)
**Response — 403:**
- non-self edit attempt by an `EMPLOYEE`
- attempt by non-`SUPER_ADMIN` to set `role: "SUPER_ADMIN"`

---

### `DELETE /api/employees/:id`
**Roles allowed:** `SUPER_ADMIN` only

Soft-deletes the employee (sets `isDeleted: true`; row is not physically removed).

**Response — 200:** `{ "message": "Employee soft-deleted" }`

---

### `GET /api/employees/:id/reportees`
**Roles allowed:** `SUPER_ADMIN`, `HR`

Returns the direct reports of the given employee.

**Response — 200:** array of employee objects (empty array if none)

---

### `PATCH /api/employees/:id/manager`
**Roles allowed:** `SUPER_ADMIN`, `HR`

**Body:**
```json
{ "managerId": 3 }
```
Pass `managerId: null` to unassign a manager.

**Response — 200:** updated employee
**Response — 400:**
- `{ "message": "An employee cannot be their own manager" }`
- `{ "message": "Circular dependency: Cannot assign a subordinate as a manager" }`

---

### `POST /api/employees/import`
**Roles allowed:** `SUPER_ADMIN`, `HR`

**Body:** `multipart/form-data`, field name `file`, a CSV with columns:
```
email,password,name,phone,designation,salary,joiningDate,status,role,departmentId,managerId
```
Rows missing `password` default to a temporary password (`Temporary123!`) — instruct new employees to change it on first login.

**Response — 200:**
```json
{ "message": "Import successful", "count": 12 }
```

---

## Organization

### `GET /api/organization/tree`
**Roles allowed:** `SUPER_ADMIN`, `HR`

Returns the full organizational hierarchy as a nested tree starting from top-level employees (those with no manager).

**Response — 200:**
```json
[
  {
    "id": 1,
    "name": "Admin User",
    "reportees": [
      { "id": 2, "name": "...", "reportees": [] }
    ]
  }
]
```

---

## Dashboard

### `GET /api/dashboard/metrics`
**Roles allowed:** `SUPER_ADMIN`, `HR`

**Response — 200:**
```json
{
  "total": 25,
  "active": 22,
  "inactive": 3,
  "departmentCount": 4,
  "departmentBreakdown": [
    { "name": "Engineering", "count": 10 },
    { "name": "Finance", "count": 5 }
  ]
}
```

---

## Error Format

All errors follow roughly this shape:
```json
{ "message": "Human-readable description", "error": "optional details" }
```
Validation errors from Zod return:
```json
{
  "message": "Validation failed",
  "errors": [ { "path": ["fieldName"], "message": "Why it failed" } ]
}
```