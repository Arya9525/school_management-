# EduNexus School Management System — Frontend Prototype

A frontend-only School Management System prototype built with HTML5, CSS3 and vanilla JavaScript. It demonstrates the role-based, Student-Master-centred workflows described in the supplied Scope of Work without React, TypeScript, APIs, a database or paid services.

## Run

1. Open `C:\Users\User\Desktop\prototype\index.html` in a modern browser (Chrome, Edge or Firefox).
2. Choose any of the 10 demo roles, or click **Use** in the credentials table.
3. Enter `123456` as the simulated OTP to sign in.

No installation, build step or web server is required. Everything runs locally.

Authentication, uploads, edits, notices and audit events are simulated in browser memory. Reloading the page resets changes. The selected role is kept in `sessionStorage` so an in-page refresh keeps you signed in.

## Demo credentials

| Role | Username | Mobile | OTP |
|---|---|---|---|
| Teacher | `priya.nair` | `9810000001` | `123456` |
| Class Teacher | `rohan.mehta` | `9810000002` | `123456` |
| School Office Staff | `neha.verma` | `9810000003` | `123456` |
| Other Non-teaching Staff | `suresh.yadav` | `9810000004` | `123456` |
| Principal | `dr.kapoor` | `9810000005` | `123456` |
| Manager | `a.malhotra` | `9810000006` | `123456` |
| Parent | `rakesh.sharma` | `9810000007` | `123456` |
| Student | `aarav.sharma` | `9810000008` | `123456` |
| School Admin | `school.admin` | `9810000009` | `123456` |
| Super Admin | `super.admin` | `9810000010` | `123456` |

Any listed username or mobile number works for its role. The OTP is fixed and clearly labelled as a frontend simulation.

## Navigation model

The UI uses five top-level pages for School Admin, two for Super Admin and fewer for every other role. Related functions are grouped into tabs so the navigation stays short.

| Role | Top-level navigation |
|---|---|
| School Admin | Dashboard, Students, Admissions & Documents, Reports, Administration |
| Super Admin | Dashboard, School Management |
| Teacher | Dashboard, My Students, Reports |
| Class Teacher | Dashboard, My Class, Reports & Verification |
| School Office Staff | Dashboard, Students, Admissions & Documents |
| Principal | Dashboard, Students, Reports |
| Manager | Dashboard, Reports |
| Parent | Dashboard, My Child |
| Student | Dashboard, My Profile |
| Other Non-teaching Staff | Dashboard |

Profile is available from the user card in the topbar and sidebar. Notices are a Dashboard tab.

### Tabs

- **Students:** Student List, Add/Edit Student, Student Profile, Promotion, Classes & Sections. Parent and Student roles open the linked student profile directly.
- **Admissions & Documents:** Admissions and Documents.
- **Reports:** Strength, Class List, Report Builder, UDISE, Verification Sheet and Photo Sheets.
- **Administration:** Masters, Academic Sessions, School Profile, Users & Roles, Modules and Audit Trail.
- **School Management:** Schools, School Admins, Module Configuration and Audit Trail.

## Screens and workflows

### Shared
- Two-step OTP login with role selector, demo credential table, resend/autofill simulation and sign out.
- Responsive shell with sidebar, role-specific navigation, session chip, profile access, toasts, confirmation dialogs and accessible forms.
- Role-scoped Student directory with search, class/section/status/archive filters and pagination.
- Student profile with personal, contact, father, mother, guardian, previous school, UDISE parameters, year-wise enrollment history, before/after change history, linked documents and print view.
- Notices with read/unread, pinning, audience targeting and publishing.
- Profile with account details, role scope, security notes and quick navigation.

### School Admin
- Dashboard: student totals, class strength, admission follow-ups, documents, recent audit and role-aware quick actions.
- Student Master: add and edit all SOW student fields, inline validation, optional photo preview, auto-generated ID/registration/admission/roll numbers, archive and restore, and before/after snapshots in change history (including address and contact fields).
- Student Promotion: select a class/section and target session, preserve the old enrollment, add a new enrollment, update class/roll and record an audit event.
- Academic Sessions: create sessions with dates, set the current session and view promotion history.
- Classes & Sections: strength by group, boys/girls, active counts, fictional class-teacher assignment and quick links.
- Reports & MIS: class/section strength, class lists, dynamic column builder, reusable report templates, UDISE output, verification sheets, photo sheets, CSV export and print.
- Photographs: class-filtered photo grid with browser-only preview, individual download using the Student Reg No filename and bulk download of uploaded photos.
- Documents: searchable repository, student linking, type filter, archive, real browser-only file upload (PDF/JPG/PNG up to 2 MB) and download.
- Masters: 19 SOW masters including class, section, sub-section, house, blood group, social category, language, board, occupation, department, designation, statuses, state, country, nationality, religion, caste and admission document types.
- Users, Roles & Permissions: add/edit/reset/disable users, create roles and edit the View/Edit/Archive/Delete permission matrix. Edit actions honour the current role's permission set.
- School Profile: editable institution profile, ID label, board, contact, at-a-glance statistics and branch list.
- Modules: per-school enable/disable configuration and configuration-only custom modules.
- Audit Trail: restricted by role in the UI, searchable/filterable, CSV export and print.

### Super Admin
- Multi-school dashboard and branch cards with declared student counts, add school, edit branch details, activate/archive branch.
- School Admin management with add, enable/disable and school assignment.
- Per-school module configuration with a school selector.
- Restricted audit access.

### Teacher / Class Teacher
- Assigned class and subject cards.
- Student lists scoped to assigned classes (teacher) or one class (class teacher).
- Class Teacher verification sheet with print and simulated completion.
- Notices and profile.

### Office / Principal / Manager
- Office: admissions pipeline, student records, document upload/access, notices.
- Principal: school-wide student directory, class strength, reports, verification, notices.
- Manager: overview and summary reports only, with a provisional scope notice.

### Parent / Student
- Parent dashboard with linked child and child profile.
- Child-linked documents only; the parent document view is scoped to the linked student.
- Student dashboard and own profile.

## SOW coverage

Implemented in the prototype:
- Role-based portals and OTP simulation for all 10 roles.
- Student Master with the complete field set from the SOW, plus UDISE parameters and previous-school details.
- Sibling details, academic session history and promotion with preserved enrollments.
- Verification sheet and print output.
- Document repository with admission document types, browser-only file upload/download and parent-scoped access.
- Student photographs with reg-no download naming and browser preview.
- All requested masters, including sub-sections, houses, blood groups, social categories, languages, boards, occupation/department/designation, statuses, state/country/nationality, religion/caste and document master.
- Dynamic report columns, saved report templates, class/section strength, class lists and UDISE output with CSV/print.
- Editable role permissions and custom role creation in the demo role matrix.
- Audit trail visible only to School Admin and Super Admin (UI restriction; simulated log).
- Multi-school Super Admin workspace, school editing, school-administrator assignment and per-school module configuration.
- Responsive layout for desktop, tablet and mobile, including horizontal table scrolling and mobile sidebar.

Out of scope in line with the SOW:
- Fee collection, payment gateways, accounting, payroll, attendance hardware, transport tracking, examinations, timetabling and real messaging.
- Backend, database, server-side authentication, durable file storage, SMS/email delivery, multi-tenant security and tamper-proof audit.

## Important limitations

- All data is fictional and stored in memory. Do not enter real personal data.
- Uploaded document files and photos are stored as data URLs in the current tab and disappear on reload. No file leaves the browser.
- CSV exports download from generated data. Printing uses browser print styles.
- Role names, permission scope and module inclusion are provisional and based on the SOW plus reasonable placeholders. Confirm authorization before production.
- Audit entries are append-only in the demo array but not tamper-resistant.
- Custom roles are configuration-only; login remains restricted to the 10 demo role accounts.

## Files

| File | Purpose |
|---|---|
| `index.html` | Login screen, app shell, containers for sidebar/topbar/view/toast/modal |
| `style.css` | Responsive white/light theme with a single blue primary colour, layouts, tables, forms and print styles |
| `script.js` | Demo data, state, routing, consolidated views, interactions, validation, uploads, CSV/print |
| `README.md` | Run instructions, credentials, navigation, scope and limitations |

## Quick test path

1. Sign in as **School Admin** (`school.admin` / `123456`).
2. Open **Students**, use search/filters and open a student profile. Use the tabs to reach Add Student, Promotion and Classes & Sections.
3. Add a student, save it, then edit the record to see before/after change history.
4. Promote a class from **Students → Promotion**, then check the profile's enrollment history.
5. Review **Reports** tabs, toggle columns, save a template, export CSV and print.
6. Open **Admissions & Documents**, upload a small PDF/image and download it again.
7. Open **Administration → Masters**, add a value and confirm it appears in the student form dropdown.
8. Check **Administration → Audit Trail** as School Admin and confirm a Teacher cannot access it.
9. Sign in as **Parent** to see the linked child and child-scoped documents.
10. Sign in as **Super Admin** to edit a school, review admins and switch per-school module configuration.
