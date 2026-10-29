# EduNexus School Management System — Frontend Prototype

A frontend-only School Management System prototype built with HTML5, CSS3 and vanilla JavaScript. It demonstrates the role-based, Student-Master-centred workflows described in the supplied Scope of Work without React, TypeScript, APIs, a database or paid services.

## Run

1. Open `C:\Users\User\index.html` in a modern browser (Chrome, Edge or Firefox).
2. Choose any of the 10 demo roles, or click **Use** in the credentials table.
3. Enter the password `123456` as the simulated OTP to sign in.

No installation, build step or web server is required. Everything runs locally.

There is also a local mode note: authentication, uploads, edits, notices and audit events are simulated in browser memory. Reloading the page resets changes. The selected role is kept in `sessionStorage` so an in-page refresh keeps you signed in.

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

## Screens and workflows

### Shared
- Two-step OTP login with role selector, demo credential table, resend/autofill simulation and sign out.
- Responsive shell with sidebar, role-specific navigation, session chip, profile menu, toasts, confirmation dialogs and accessible forms.
- Role-scoped Student directory with search by name/ID/mobile/father/PEN, class, section, status and archive filters plus pagination.
- Student profile with personal, contact, father, mother, guardian, previous school, UDISE parameters, year-wise enrollment history, change history, linked documents and print view.
- Notices with read/unread, pinning, audience targeting and publishing.
- Profile with account details, role scope, security notes and quick navigation.

### School Admin
- Dashboard: student totals, admission pipeline, class strength, documents, recent audit, quick actions.
- Student Master: add and edit all SOW student fields, inline validation, optional photo preview, auto-generated ID/registration/admission/roll numbers, archive and restore, before-change snapshots in change history.
- Student Promotion: select a class/section and target session, preserve the old enrollment, add a new enrollment, update class/roll and record an audit event.
- Academic Sessions: create sessions with dates, set current session, view promotion history.
- Classes & Sections: strength by group, boys/girls, active counts, class teacher assignment (fictional), quick links.
- Reports & MIS: class/section strength, class lists, dynamic column builder, UDISE report, CSV export and print.
- Verification Sheet: printable class sheet with student signatures and a simulated verified action.
- Photographs: class-filtered photo grid with browser-only image preview and upload state.
- Documents: searchable repository, student linking, document type filter, archive, metadata-only add form.
- Masters: 19 SOW masters including class, section, sub-section, house, blood group, social category, language, board, occupation, department, designation, statuses, state, country, nationality, religion, caste and admission document types.
- Users, Roles & Permissions: user CRUD-lite (add/edit/reset/disable), role matrix and role-scoped navigation.
- School Information: editable institution profile, ID label, board, contact, at-a-glance statistics and branch list.
- Module Configuration: enable/disable demo modules and add configuration-only modules.
- Audit Trail: restricted by role in the UI, searchable/filterable, CSV export and print.

### Super Admin
- Multi-school dashboard, branch cards with declared student counts, add school, activate/archive branch.
- School Admin management with add, enable/disable and school assignment.
- Module configuration and restricted audit access.

### Teacher / Class Teacher
- Assigned class and subject cards.
- Student lists scoped to assigned classes (teacher) or one class (class teacher).
- Class Teacher-only verification sheet with print and simulated completion.
- Notices and profile.

### Office / Principal / Manager
- Office: admissions pipeline, student records, document access, notices.
- Principal: school-wide student directory, class strength, reports, verification, notices.
- Manager: overview and summary reports only, with a provisional scope notice.

### Parent / Student
- Parent dashboard with linked child, sibling context, attendance/fee placeholders, events and notices.
- Child profile and child-linked documents only.
- Student dashboard and own profile.
- Parent notices include PTM and verification communications.

## SOW coverage

Implemented in the prototype:
- Role-based portals and OTP simulation for all 10 roles.
- Student Master with the complete field set from the SOW, plus UDISE parameters and previous-school details.
- Sibling details, academic session history and promotion with preserved enrollments.
- Verification sheet and print output.
- Document repository with admission document types and parent-scoped access.
- Student photographs with naming guidance and browser preview.
- All requested masters, including sub-sections, houses, blood groups, social categories, languages, boards, occupation/department/designation, statuses, state/country/nationality, religion/caste and document master.
- Dynamic report columns, class/section strength, class lists and UDISE output with CSV/print.
- Audit trail visible only to School Admin and Super Admin (UI restriction; simulated log).
- Multi-school Super Admin workspace and school-administrator assignment.
- Responsive layout for desktop, tablet and mobile, including horizontal table scrolling and mobile sidebar.

Out of scope in line with the SOW:
- Fee collection, payment gateways, accounting, payroll, attendance hardware, transport tracking, examinations, timetabling and real messaging.
- Backend, database, server-side authentication, real file storage, SMS/email delivery, multi-tenant security and tamper-proof audit.
- Fees shown on parent dashboards are illustrative placeholders only.

## Important limitations

- All data is fictional and stored in memory. Do not enter real personal data.
- Photos, document uploads and exports are frontend simulations. Document rows are metadata only; images remain data URLs in the current tab.
- CSV exports download from generated data. Printing uses browser print styles.
- Role names, permission scope and module inclusion are provisional and based on the SOW plus reasonable placeholders. Confirm authorization before production.
- Audit entries are append-only in the demo array but not tamper-resistant.
- Homepage statistics, attendance and fee indicators on some dashboards are illustrative demo content, not calculated business records.

## Files

| File | Purpose |
|---|---|
| `index.html` | Login screen, app shell, containers for sidebar/topbar/view/toast/modal |
| `style.css` | Responsive blue-violet theme, layouts, tables, forms, print styles |
| `script.js` | Demo data, state, routing, all views, interactions, validation, CSV/print |
| `README.md` | Run instructions, credentials, scope and limitations |

## Quick test path

1. Sign in as **School Admin** (`school.admin` / `123456`).
2. Open **Student Master** and use search/filters; open a student profile.
3. Add a student, save it, then edit the record to see change history.
4. Promote a class from **Student Promotion**, then check the profile's enrollment history.
5. Review **Reports & MIS** tabs, toggle report columns, export CSV and print.
6. Open **Masters**, add a value, and confirm it appears in the student form dropdown.
7. Check **Audit Trail** as School Admin and as Teacher (teacher cannot access it).
8. Sign in as **Parent** to see child-scoped documents and notices.
9. Sign in as **Super Admin** to review schools, admins, modules and audit.
