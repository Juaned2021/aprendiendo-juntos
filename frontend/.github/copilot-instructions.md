# AI Agent Instructions for Plataforma-Escolar

## Project Overview
**Plataforma-Escolar** is a React + Vite educational platform with role-based access (Admin, Profesor, Alumno). It uses:
- **Frontend**: React 19 + React Router v7
- **Build**: Vite with dev proxy to `https://localhost:7028/api`
- **State**: React hooks + axios + sessionStorage token
- **CSS**: Modular CSS per component (no CSS-in-JS framework)

## Architecture Patterns

### 1. Route Structure & Role-Based Access
```
/login                    → Login page (no auth required)
/admin/...               → Admin dashboard (protected, role: 'Admin')
  - usuarios, clases, materias, horarios, recursos, chats
/profesor/...            → Profesor dashboard (protected, role: 'Profesor')
  - horario, chats
/alumno/...              → Alumno dashboard (protected, role: 'Alumno')
  - chats
```

**Pattern**: All protected routes use `<ProtectedRoute allowedRoles={['Role']}>` wrapper in `App.jsx`.
Redirect chain: `getRoles()` from sessionStorage → `hasRole()` check → redirect to `/login` if unauthorized.

### 2. API & Authorization
- **Base URL**: Configured via env var `VITE_API_URL` → proxy through Vite at `/api` → `https://localhost:7028/api`
- **Token**: Stored in `sessionStorage` after login
- **Interceptor**: All requests auto-inject `Authorization: Bearer <token>` header
- **Error handling**: 401 response triggers `clearAuthData()` + redirect to `/login`

**Key files**:
- `src/services/api.js` - axios instance with interceptors
- `src/services/authService.js` - login/logout + token validation
- `src/utils/auth.js` - helper functions (getRoles, hasRole, getUserId)

### 3. Service Layer Pattern
Each role has a dedicated service file (`adminService.js`, `profesorService.js`, `alumnoService.js`):
```javascript
// Pattern: Always use named exports
export const functionName = async (params) => {
  const response = await api.get('/endpoint');
  return response.data;  // Auto-unwrap .data
};
```

**Chats API endpoints** (after recent updates):
- GET `/chats/{idChat}/mensajes` → returns array with `esProfesor` & `esAlumno` flags
- POST `/chats/{idChat}/mensaje?idUsuario={id}&mensaje={text}` → send message

### 4. Layout & Navigation Pattern
Three layout components wrap nested routes with navbar:
- `AdminLayout` + `Navbar` (admin menu)
- `ProfesorLayout` + `ProfesorNavbar` (profesor menu)
- `AlumnoLayout` + `AlumnoNavbar` (alumno menu)

Each uses `<Outlet />` for nested route rendering.

### 5. Component & Message Rendering Patterns

**Toast notifications** (global, non-blocking):
```javascript
import { toast } from '../../components/Toast';
toast.success('Mensaje');   // Auto-dismiss after 3s
toast.error('Error');       // Types: success, error, info, warning
```

**Chat message rendering** (recent update):
- Messages now include `esProfesor` / `esAlumno` flags from backend
- Frontend determines `esPropio = (m.esAlumno || m.esProfesor)` based on user role
- Apply CSS class: `className={m.esPropio ? 'propio' : 'ajeno'}` for styling

## Developer Workflows

### Build & Dev
```bash
npm run dev       # Start Vite at http://localhost:3000 (auto proxies to C# backend)
npm run build     # Production bundle to ./dist
npm run lint      # ESLint check
npm run preview   # Preview built output
```

**Frontend builds to `dist/`, backend handles CORS** (ensure `.env.local` has `VITE_API_URL` set correctly).

### Code Patterns to Follow

#### Async Data Fetching
```javascript
const [data, setData] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  fetchData();
}, []);

const fetchData = async () => {
  try {
    setLoading(true);
    const result = await serviceFunction();
    setData(result);
  } catch (error) {
    toast.error('Error message');
  } finally {
    setLoading(false);
  }
};
```

#### Form Submission
```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validate()) return;
  
  try {
    setSubmitting(true);
    await serviceFunction(payload);
    toast.success('Success');
    resetForm();
  } catch (error) {
    toast.error(error.response?.data || 'Error');
  } finally {
    setSubmitting(false);
  }
};
```

#### Role-Based Rendering
```javascript
import { hasRole } from '../utils/auth';
if (hasRole('Profesor')) { /* show profesor UI */ }
if (hasRole('Alumno')) { /* show alumno UI */ }
```

## Project-Specific Conventions

### File Naming & Org
- Component file = PascalCase (`AlumnoChats.jsx`, `Navbar.jsx`)
- CSS file = same name as component with `.css` extension
- Service files = camelCase (`adminService.js`)
- Each feature folder contains: Component.jsx + Component.css + utilities

### CSS Conventions
- Global styles: `src/styles/global.css`, `reset.css`, `variables.css`, `utilities.css`
- Component CSS is scoped to that component (class `.clase-name`)
- Use CSS Grid for layouts (`.chats-layout`), flexbox for alignment
- Badge classes: `.badge-success`, `.badge-danger` for status indicators

### Message & Data Field Naming
- Backend sends: `idMensaje`, `idUsuarioEmisorFK`, `mensaje`, `fechaEnvio`, `esProfesor`, `esAlumno`
- Frontend uses same casing (respect PascalCase from .NET backend)
- Fallback for older data: `m.mensaje || m.mensajeTexto` (handle both field names)

## Critical Integration Points

### Adding New Admin Page
1. Create `src/pages/admin/PageName.jsx` + `.css`
2. Add endpoint to `adminService.js`
3. Add route to `App.jsx` under `/admin`
4. Add navbar link in `Navbar.jsx`

### Adding New Chat Feature
- Chats use `/chats/{idChat}/mensajes` endpoint
- Messages = `[{ idMensaje, idUsuarioEmisorFK, mensaje, fechaEnvio, esProfesor, esAlumno, ... }]`
- Always normalize based on `esProfesor`/`esAlumno` (not idUsuarioEmisorFK comparison)
- Apply `.propio` / `.ajeno` classes for styling based on role

### Adding Authentication Check
```javascript
const isAuthed = isAuthenticated();  // checks token + expiry
const idUsuario = getUserId();       // returns id from sessionStorage
const roles = getRoles();            // returns role array
```

## Common Pitfalls to Avoid

1. **Don't hardcode `/api` prefix** - axios instance already includes it via base URL
2. **Don't store sensitive data in localStorage** - use sessionStorage for token (cleared on logout)
3. **Don't forget token expiry check** - `isAuthenticated()` handles this, `login()` sets `tokenExpira`
4. **Don't fetch in render** - always use `useEffect` for data loading
5. **Don't assume message field names** - use `esProfesor`/`esAlumno` flags, fallback field names with `||`
6. **Don't define serviceFunction inside component** - extract to `services/*` for reusability

## Environment & Build Config

**Vite config** (`vite.config.js`):
- Dev proxy: `/api` → `https://localhost:7028` (backend C# server)
- Build output: `dist/` with sourcemap disabled, terser minify
- Chunk splitting: vendor (react, react-router) + utils (axios, jspdf, xlsx)
- Dev server: port 3000

**Required env vars** (or defaults):
- `VITE_API_URL` - backend URL (used in `src/services/api.js`)

## Quick Checklist Before Committing

- [ ] Run `npm run lint` - no errors
- [ ] Test with backend running on `https://localhost:7028`
- [ ] Verify toast messages appear (import & use `toast` from `components/Toast`)
- [ ] Check responsive CSS (Grid + Flexbox, no hardcoded pixel widths)
- [ ] Use `<ProtectedRoute>` for new admin/profesor/alumno pages
- [ ] Add new service functions to appropriate `*Service.js` file
- [ ] Message rendering uses `esProfesor`/`esAlumno` not userId comparison

---

## 🚀 AWS Production Deployment

### Infrastructure Overview

Plataforma-Escolar is designed to run on AWS with the following architecture:

```
┌─────────────────────────────────────────────────────────────┐
│ FRONTEND (React + Vite)                                     │
│ - S3 Bucket: plataforma-escolar-frontend                    │
│ - CloudFront: Global CDN with caching                       │
│ - Domain: app.tudominio.com (via Route 53)                  │
│ - HTTPS: ACM SSL Certificate (auto-renewing)                │
└─────────────────────────────────────────────────────────────┘
                            ↓ HTTPS
┌─────────────────────────────────────────────────────────────┐
│ BACKEND (API .NET + IIS)                                    │
│ - EC2 Instance: t3.small (1GB RAM)                          │
│ - Port: 443 (HTTPS)                                         │
│ - Domain: api.tudominio.com                                 │
│ - Load Balancer: Application Load Balancer                  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ DATABASE (MySQL + RDS)                                      │
│ - Type: db.t3.micro                                         │
│ - Storage: 20GB SSD                                         │
│ - Backups: Automated daily snapshots                        │
│ - Security: VPC endpoint, no public access                  │
└─────────────────────────────────────────────────────────────┘
```

### Deployment Scripts

**PowerShell** (Windows):
```bash
# Deploy frontend to S3 + CloudFront (with cache invalidation)
.\deploy-aws.ps1 -BucketName "plataforma-escolar-frontend" `
                 -DistributionId "E1234567890ABCD" `
                 -Region "us-east-1"
```

**Bash** (Linux/Mac):
```bash
# Make script executable
chmod +x deploy-aws.sh

# Run deployment
./deploy-aws.sh "plataforma-escolar-frontend" "E1234567890ABCD" "us-east-1"
```

### Environment Variables for Production

**Frontend** (`.env.production`):
```env
VITE_API_URL=https://api.tudominio.com/api
VITE_S3_BUCKET=plataforma-escolar-recursos
VITE_CDN_URL=https://d123456789.cloudfront.net
VITE_AWS_REGION=us-east-1
VITE_API_TIMEOUT=10000
VITE_DEBUG_MODE=false
```

**Backend** (appsettings.Production.json):
```json
{
  "CorsSettings": {
    "AllowedOrigins": ["https://app.tudominio.com"]
  },
  "Logging": {
    "LogLevel": {
      "Default": "Warning"
    }
  }
}
```

### CORS Configuration for .NET Backend

See `AWS-CORS-CONFIG.md` for complete CORS setup. Quick version:

```csharp
// Program.cs
builder.Services.AddCors(options =>
{
    options.AddPolicy("ProductionPolicy", policy =>
    {
        policy
            .WithOrigins("https://app.tudominio.com")
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials()
            .WithExposedHeaders("Content-Disposition");
    });
});

app.UseCors("ProductionPolicy");
```

### Pre-Deployment Checklist

**Code**:
- [ ] `npm run build` completes with no errors
- [ ] `npm run lint` passes
- [ ] No hardcoded credentials in code
- [ ] `.env.production` file configured with real AWS values
- [ ] Backend CORS policy configured for `https://app.tudominio.com`

**AWS Infrastructure**:
- [ ] S3 bucket created and versioning enabled
- [ ] CloudFront distribution created with cache policies
- [ ] EC2 instance launched with security groups configured
- [ ] RDS MySQL database created with backups enabled
- [ ] Route 53 hosted zone created with DNS records
- [ ] ACM SSL certificate requested and validated
- [ ] Database backed up locally before migration

**Deployment**:
- [ ] Domain DNS updated to point to CloudFront + EC2
- [ ] Frontend deployed to S3 and CloudFront cache invalidated
- [ ] Backend .NET published to EC2/IIS
- [ ] Database migrated to RDS
- [ ] SSL certificates installed on EC2/IIS
- [ ] CloudWatch monitoring enabled

### Post-Deployment Verification

1. **Frontend Access**:
   ```bash
   curl -I https://app.tudominio.com
   # Expected: 200 OK with CloudFront headers
   ```

2. **API Connectivity**:
   ```bash
   curl -I https://api.tudominio.com/api/health
   # Expected: 200 OK
   ```

3. **CORS Headers**:
   ```bash
   curl -I -H "Origin: https://app.tudominio.com" \
        https://api.tudominio.com/api
   # Expected: Access-Control-Allow-Origin: https://app.tudominio.com
   ```

4. **Database Connection**:
   - Login via app and verify data loads correctly
   - Check CloudWatch RDS performance metrics

5. **SSL Certificates**:
   ```bash
   openssl s_client -connect api.tudominio.com:443
   # Expected: Certificate valid and chain complete
   ```

### Cost Optimization Tips

1. **S3 + CloudFront**: ~$10-15/month
   - Use S3 Intelligent-Tiering for old assets
   - Enable CloudFront cache for 1-year max-age on versioned assets

2. **EC2**: ~$10-15/month (t3.small)
   - Use reserved instances for longer contracts (20-40% savings)
   - Use Auto Scaling Groups for high-traffic periods

3. **RDS**: ~$15-30/month (db.t3.micro)
   - Use Multi-AZ only if you need HA (adds ~50%)
   - Store old backups in S3 for cost savings

4. **Domain**: ~$10-12/year

### Troubleshooting

**CORS Errors**:
- See `AWS-CORS-CONFIG.md` debugging section
- Check CloudWatch logs for CORS policy violations
- Verify `AllowedOrigins` matches CloudFront URL exactly

**Frontend Not Loading**:
- Verify S3 bucket is public/CloudFront has access
- Check CloudFront invalidations are complete
- Clear browser cache (Ctrl+Shift+Delete)

**API Connection Failures**:
- Check security groups allow HTTPS (443)
- Verify EC2 instance is running
- SSH into EC2 and test SQL Server connection

**Database Access Issues**:
- Verify RDS security group allows EC2 instance
- Check connection string has correct endpoint
- Verify credentials haven't expired in RDS

### Related Documentation

- See `PRODUCCION.md` for step-by-step setup guide
- See `AWS-CORS-CONFIG.md` for CORS configuration details
- See `deploy-aws.ps1` / `deploy-aws.sh` for deployment scripts
- See `.env.example` for all available environment variables

### AWS Resources & Links

- [AWS EC2 Documentation](https://docs.aws.amazon.com/ec2/)
- [AWS RDS Documentation](https://docs.aws.amazon.com/rds/)
- [AWS S3 + CloudFront Guide](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html)
- [AWS CloudFormation Templates](https://docs.aws.amazon.com/cloudformation/)

---
