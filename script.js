/* EduNexus - School Management System (frontend-only demonstration)
   All data is fictional and held in memory. No backend, API or real authentication. */
'use strict';

/* ============================= helpers ============================= */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pad = (n, l = 2) => String(n).padStart(l, '0');
const initials = name => String(name || '').trim().split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('') || 'NA';
const byId = id => DB.students.find(s => s.id === id);
const todayStr = () => new Date().toISOString().slice(0, 10);
const fmtDate = d => { if (!d) return '—'; const x = new Date(d + 'T00:00:00'); return isNaN(x) ? d : x.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }); };
const nowStamp = () => new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
const classOrder = c => { const i = DB.masters.classes.indexOf(c); return i < 0 ? 99 : i; };
const nextClassOf = c => { const i = DB.masters.classes.indexOf(c); return i >= 0 && i < DB.masters.classes.length - 1 ? DB.masters.classes[i + 1] : c; };
const activeSchoolSession = () => DB.sessions.find(s => s.current) || DB.sessions[0];
const filterList = (list, q, keys) => { const t = q.trim().toLowerCase(); return !t ? list : list.filter(x => keys.some(k => String(x[k] || '').toLowerCase().includes(t))); };
const pill = (text, type = 'grey') => `<span class="pill ${type}">${esc(text)}</span>`;
const statusPill = s => pill(s, { Active: 'green', 'TC Taken': 'amber', 'Drop Out': 'red', Selection: 'green', 'Form Filled': 'blue', 'Payment Made': 'violet', 'Called for Interaction': 'amber', 'Not Selected': 'red', Paid: 'green', Pending: 'amber', Archived: 'grey', Current: 'green', Upcoming: 'blue' }[s] || 'grey');
const opts = (arr, val, ph) => (ph ? `<option value="">${esc(ph)}</option>` : '') + arr.map(x => `<option${x === val ? ' selected' : ''}>${esc(x)}</option>`).join('');
const kv = (label, val) => `<div><span>${esc(label)}</span><b>${esc(val || '—')}</b></div>`;
const avatar = (s, cls = '') => `<span class="avatar ${cls}">${s.photo ? `<img src="${s.photo}" alt="">` : esc(initials(s.name))}</span>`;
const accountAvatar = (name, cls = '') => `<span class="avatar ${cls}">${esc(initials(name))}</span>`;

/* ============================= icons ============================= */
const ICONS = {
  grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  school: '<path d="M3 21h18"/><path d="M5 21V10l7-5 7 5v11"/><path d="M9 21v-6h6v6"/><path d="M9 10h.01M15 10h.01"/>',
  book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
  bell: '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>',
  check: '<path d="M20 6L9 17l-5-5"/>',
  checks: '<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>',
  file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8M16 17H8M10 9H8"/>',
  folder: '<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>',
  chart: '<path d="M3 3v18h18"/><path d="M18 17V9M13 17V5M8 17v-3"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
  image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/>',
  upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M17 8l-5-5-5 5"/><path d="M12 3v12"/>',
  print: '<path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>',
  edit: '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4z"/>',
  archive: '<rect x="3" y="3" width="18" height="5" rx="1"/><path d="M5 8v13h14V8"/><path d="M10 12h4"/>',
  logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  layers: '<path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>',
  id: '<rect x="2" y="5" width="20" height="14" rx="2"/><circle cx="8" cy="11" r="2"/><path d="M5 16c0-1.5 1.5-2.5 3-2.5s3 1 3 2.5"/><path d="M14 9h5M14 13h5"/>',
  trend: '<path d="M23 6l-9.5 9.5-5-5L1 18"/><path d="M17 6h6v6"/>',
  building: '<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4M8 6h.01M16 6h.01M8 10h.01M16 10h.01M8 14h.01M16 14h.01"/>',
  arrow: '<path d="M5 12h14M12 5l7 7-7 7"/>',
  mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 6l-10 7L2 6"/>',
  phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>',
  pin: '<path d="M12 17v5"/><path d="M9 3h6l1 7 3 3v1H5v-1l3-3z"/>',
  send: '<path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4z"/>',
  eye: '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"/><circle cx="12" cy="12" r="3"/>',
  key: '<path d="M21 2l-2 2m-7.6 7.6a5 5 0 1 1-7.1 7.1 5 5 0 0 1 7.1-7.1zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3"/>',
  lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>'
};
const ic = (name, cls = '') => `<svg class="i ${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name] || ICONS.grid}</svg>`;

/* ============================= roles + navigation ============================= */
const ROLES = {
  teacher: { label: 'Teacher', name: 'Priya Nair', username: 'priya.nair', mobile: '9810000001', desc: 'Subject teacher access to assigned classes and students.' },
  class_teacher: { label: 'Class Teacher', name: 'Rohan Mehta', username: 'rohan.mehta', mobile: '9810000002', desc: 'Class-level access with verification sheet.' },
  office: { label: 'School Office Staff', name: 'Neha Verma', username: 'neha.verma', mobile: '9810000003', desc: 'Student records, admissions and documents. Provisional permissions.' },
  staff: { label: 'Other Non-teaching Staff', name: 'Suresh Yadav', username: 'suresh.yadav', mobile: '9810000004', desc: 'Profile and basic landing page. Provisional permissions.' },
  principal: { label: 'Principal', name: 'Dr. Meera Kapoor', username: 'dr.kapoor', mobile: '9810000005', desc: 'School overview, student strength and reports.' },
  manager: { label: 'Manager', name: 'Ashok Malhotra', username: 'a.malhotra', mobile: '9810000006', desc: 'Overview and authorized summary reports. Provisional permissions.' },
  parent: { label: 'Parent', name: 'Rakesh Sharma', username: 'rakesh.sharma', mobile: '9810000007', desc: 'Linked child profile and student details.' },
  student: { label: 'Student', name: 'Aarav Sharma', username: 'aarav.sharma', mobile: '9810000008', desc: 'Own profile, academic session and class details.' },
  admin: { label: 'School Admin', name: 'Anil Deshmukh', username: 'school.admin', mobile: '9810000009', desc: 'Full school administration including audit trail.' },
  super: { label: 'Super Admin', name: 'Kavita Rao', username: 'super.admin', mobile: '9810000010', desc: 'Multi-school oversight, modules and School Admins.' }
};
const ROLE_KEYS = Object.keys(ROLES);

const NAV = {
  teacher: [{ section: 'Teaching', items: [{ v: 'dashboard', label: 'Dashboard', icon: 'grid' }, { v: 'classes', label: 'My Classes', icon: 'book' }, { v: 'students', label: 'My Students', icon: 'users' }, { v: 'notices', label: 'Notices', icon: 'bell' }, { v: 'profile', label: 'My Profile', icon: 'user' }] }],
  class_teacher: [{ section: 'My Class', items: [{ v: 'dashboard', label: 'Dashboard', icon: 'grid' }, { v: 'classes', label: 'My Class', icon: 'book' }, { v: 'students', label: 'Student List', icon: 'users' }, { v: 'verification', label: 'Verification Sheet', icon: 'checks' }, { v: 'notices', label: 'Notices', icon: 'bell' }, { v: 'profile', label: 'My Profile', icon: 'user' }] }],
  office: [{ section: 'Front Office', items: [{ v: 'dashboard', label: 'Dashboard', icon: 'grid' }, { v: 'admissions', label: 'Admissions', icon: 'layers' }, { v: 'students', label: 'Student Records', icon: 'users' }, { v: 'documents', label: 'Document Access', icon: 'folder' }, { v: 'notices', label: 'Notices', icon: 'bell' }, { v: 'profile', label: 'My Profile', icon: 'user' }] }],
  staff: [{ section: 'Workspace', items: [{ v: 'dashboard', label: 'Dashboard', icon: 'grid' }, { v: 'notices', label: 'Notices', icon: 'bell' }, { v: 'profile', label: 'My Profile', icon: 'user' }] }],
  principal: [{ section: 'School Overview', items: [{ v: 'dashboard', label: 'Dashboard', icon: 'grid' }, { v: 'students', label: 'Student Directory', icon: 'users' }, { v: 'reports', label: 'Class Strength', icon: 'chart' }, { v: 'verification', label: 'Verification', icon: 'checks' }, { v: 'notices', label: 'Notices', icon: 'bell' }, { v: 'profile', label: 'My Profile', icon: 'user' }] }],
  manager: [{ section: 'Management', items: [{ v: 'dashboard', label: 'Dashboard', icon: 'grid' }, { v: 'reports', label: 'Summary Reports', icon: 'chart' }, { v: 'notices', label: 'Notices', icon: 'bell' }, { v: 'profile', label: 'My Profile', icon: 'user' }] }],
  parent: [{ section: 'My Family', items: [{ v: 'dashboard', label: 'Dashboard', icon: 'grid' }, { v: 'student-detail', id: 'st1', label: 'Child Profile', icon: 'id' }, { v: 'documents', label: 'Documents', icon: 'folder' }, { v: 'notices', label: 'Notices', icon: 'bell' }, { v: 'profile', label: 'My Profile', icon: 'user' }] }],
  student: [{ section: 'My School', items: [{ v: 'dashboard', label: 'Dashboard', icon: 'grid' }, { v: 'student-detail', id: 'st1', label: 'My Profile', icon: 'id' }, { v: 'notices', label: 'Notices', icon: 'bell' }] }],
  admin: [
    { section: 'Overview', items: [{ v: 'dashboard', label: 'Dashboard', icon: 'grid' }] },
    { section: 'Student Management', items: [{ v: 'students', label: 'Student Master', icon: 'users' }, { v: 'admissions', label: 'Admissions', icon: 'layers' }, { v: 'promotion', label: 'Student Promotion', icon: 'trend' }, { v: 'sessions', label: 'Academic Sessions', icon: 'calendar' }, { v: 'classes', label: 'Classes & Sections', icon: 'book' }] },
    { section: 'Reports & Records', items: [{ v: 'reports', label: 'Reports & MIS', icon: 'chart' }, { v: 'verification', label: 'Verification Sheet', icon: 'checks' }, { v: 'photos', label: 'Photographs', icon: 'image' }, { v: 'documents', label: 'Documents', icon: 'folder' }] },
    { section: 'Administration', items: [{ v: 'masters', label: 'Masters', icon: 'layers' }, { v: 'users', label: 'Users & Roles', icon: 'shield' }, { v: 'school', label: 'School Information', icon: 'school' }, { v: 'modules', label: 'Module Configuration', icon: 'settings' }, { v: 'notices', label: 'Notices', icon: 'bell' }, { v: 'audit', label: 'Audit Trail', icon: 'clock' }] }
  ],
  super: [{ section: 'Multi-school', items: [{ v: 'dashboard', label: 'Dashboard', icon: 'grid' }, { v: 'schools', label: 'Schools', icon: 'building' }, { v: 'admins', label: 'School Admins', icon: 'shield' }, { v: 'modules', label: 'Module Configuration', icon: 'settings' }, { v: 'audit', label: 'Audit Trail', icon: 'clock' }, { v: 'profile', label: 'My Profile', icon: 'user' }] }]
};

/* ============================= fictional data ============================= */
const MASTER_DEFS = [
  { key: 'classes', label: 'Class', items: ['Nursery', 'LKG', 'UKG', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'] },
  { key: 'sections', label: 'Section', items: ['A', 'B', 'C', 'D'] },
  { key: 'subSections', label: 'Sub-section', items: ['Science', 'Commerce', 'Humanities', 'Mathematics'] },
  { key: 'houses', label: 'House', items: ['Ruby', 'Sapphire', 'Emerald', 'Topaz'] },
  { key: 'bloodGroups', label: 'Blood Group', items: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-', 'Not Known'] },
  { key: 'socialCategories', label: 'Social Category', items: ['General', 'OBC', 'SC', 'ST', 'EWS'] },
  { key: 'languages', label: 'Language', items: ['Hindi', 'English', 'Urdu', 'Bengali', 'Punjabi', 'Marathi', 'Tamil'] },
  { key: 'boards', label: 'Board', items: ['CBSE', 'ICSE', 'State Board', 'IB', 'Other'] },
  { key: 'occupations', label: 'Occupation', items: ['Service', 'Business', 'Self Employed', 'Agriculture', 'Homemaker', 'Retired', 'Other'] },
  { key: 'departments', label: 'Department', items: ['Administration', 'Finance', 'Operations', 'Sales', 'Education', 'Health', 'Other'] },
  { key: 'designations', label: 'Designation', items: ['Manager', 'Officer', 'Executive', 'Engineer', 'Teacher', 'Consultant', 'Other'] },
  { key: 'studentStatuses', label: 'Student Status', items: ['Active', 'TC Taken', 'Drop Out'] },
  { key: 'admissionStatuses', label: 'Admission Status', items: ['Form Filled', 'Payment Made', 'Called for Interaction', 'Selection', 'Not Selected'] },
  { key: 'states', label: 'State', items: ['Uttar Pradesh', 'Delhi', 'Haryana', 'Rajasthan', 'Madhya Pradesh', 'Bihar', 'Maharashtra', 'Punjab'] },
  { key: 'countries', label: 'Country', items: ['India', 'Nepal', 'Bangladesh', 'Bhutan', 'Other'] },
  { key: 'nationalities', label: 'Nationality', items: ['Indian', 'Nepali', 'Bangladeshi', 'Bhutanese', 'Other'] },
  { key: 'religions', label: 'Religion', items: ['Hindu', 'Muslim', 'Christian', 'Sikh', 'Buddhist', 'Jain', 'Other'] },
  { key: 'castes', label: 'Caste', items: ['General', 'OBC', 'SC', 'ST', 'Other'] },
  { key: 'documentTypes', label: 'Admission Documents', items: ['Birth Certificate', 'Transfer Certificate', 'Previous Report Card', 'Address Proof', 'Medical Record', 'Photograph'] }
];

const MODULE_DEFS = [
  ['studentMaster', 'Student Master'], ['admissions', 'Admissions'], ['promotion', 'Student Promotion'],
  ['reports', 'MIS Reports'], ['udise', 'UDISE Report'], ['photographs', 'Photographs'],
  ['documents', 'Document Repository'], ['audit', 'Audit Trail']
];
const MODULE_META = {
  studentMaster: ['Core student records, identifiers and history.', 'Admin, Office, Teachers'],
  admissions: ['Admission enquiry to completion workflow.', 'Admin, Office'],
  promotion: ['Class promotion with session history.', 'Admin'],
  reports: ['Class strength, lists and dynamic reports.', 'Admin, Principal, Manager'],
  udise: ['UDISE-specific student output.', 'Admin, Principal'],
  photographs: ['Student photo upload and review.', 'Admin, Office'],
  documents: ['Admission document repository.', 'Admin, Office, Parent'],
  audit: ['Restricted activity trail.', 'Admin, Super Admin']
};
MODULE_DEFS.forEach(m => { m.key = m[0]; m.name = m[1]; m.desc = (MODULE_META[m[0]] || ['', ''])[0]; m.roles = (MODULE_META[m[0]] || ['', ''])[1]; m.enabled = true; });
const allModules = () => Object.fromEntries(MODULE_DEFS.map(m => [m[0], true]));

const DB = {
  school: null,
  schools: [
    { id: 'sch1', name: 'Sunrise Public School', code: 'SPS-AG', initials: 'SP', city: 'Agra', address: '12 Mall Road, Agra, Uttar Pradesh 282001', phone: '0562 240 1188', email: 'office@sunrisepublic.example', status: 'active', students: 164, modules: allModules() },
    { id: 'sch2', name: 'Green Valley International', code: 'GVI-AG', initials: 'GV', city: 'Agra', address: '44 Fatehabad Road, Agra, Uttar Pradesh 282001', phone: '0562 285 4400', email: 'hello@greenvalley.example', status: 'active', students: 212, modules: allModules() },
    { id: 'sch3', name: "St. Xavier's Academy", code: 'SXA-NO', initials: 'SX', city: 'Noida', address: 'Sector 62, Noida, Uttar Pradesh 201309', phone: '0120 410 2200', email: 'office@stxaviers.example', status: 'active', students: 146, modules: allModules() },
    { id: 'sch4', name: 'Bluebell Play School', code: 'BPS-MT', initials: 'BP', city: 'Mathura', address: '7 Civil Lines, Mathura, Uttar Pradesh 281001', phone: '0565 240 9090', email: 'care@bluebell.example', status: 'archived', students: 58, modules: Object.assign(allModules(), { audit: false, udise: false }) }
  ],
  sessions: [
    { id: 'ses1', name: '2027-28', start: '2027-04-01', end: '2028-03-31', current: false },
    { id: 'ses2', name: '2026-27', start: '2026-04-01', end: '2027-03-31', current: true },
    { id: 'ses3', name: '2025-26', start: '2025-04-01', end: '2026-03-31', current: false },
    { id: 'ses4', name: '2024-25', start: '2024-04-01', end: '2025-03-31', current: false }
  ],
  masters: {},
  students: [],
  users: [],
  roles: [],
  docs: [],
  audit: [],
  admins: [
    { id: 'sa1', name: 'Anil Deshmukh', email: 'anil.deshmukh@example.com', mobile: '9810000009', schoolId: 'sch1', status: 'Active' },
    { id: 'sa2', name: 'Shalini Iyer', email: 'shalini.iyer@example.com', mobile: '9810000011', schoolId: 'sch2', status: 'Active' },
    { id: 'sa3', name: 'Vikram Sethi', email: 'vikram.sethi@example.com', mobile: '9810000012', schoolId: 'sch3', status: 'Active' },
    { id: 'sa4', name: 'Ritu Bansal', email: 'ritu.bansal@example.com', mobile: '9810000013', schoolId: 'sch2', status: 'Disabled' }
  ],
  notices: [
    { id: 'n1', title: 'Half-yearly examination schedule published', body: 'The exam schedule for Classes 3 to 8 is now available with class teachers. Exams begin on 16 November 2026.', date: '2026-10-28', audience: ['teacher', 'class_teacher', 'principal', 'admin', 'parent', 'student'], read: false },
    { id: 'n2', title: 'Student verification sheets due this Friday', body: 'Class teachers must submit signed verification sheets after sharing them with students and parents.', date: '2026-10-27', audience: ['teacher', 'class_teacher', 'principal', 'admin'], read: false },
    { id: 'n3', title: 'Admission document audit for session 2026-27', body: 'The front office will reconcile pending admission documents with the Student Master this week.', date: '2026-10-26', audience: ['office', 'admin', 'principal'], read: false },
    { id: 'n4', title: 'Parent-teacher meeting on 8 November', body: 'PTM will run from 9:00 AM to 1:00 PM. Parents may review their child profile before the meeting.', date: '2026-10-24', audience: ['teacher', 'class_teacher', 'parent', 'student', 'principal', 'admin'], read: false },
    { id: 'n5', title: 'Campus maintenance notice', body: 'The science block will remain closed on Saturday for electrical maintenance. Staff should use the main gate.', date: '2026-10-22', audience: ['staff', 'teacher', 'class_teacher', 'office', 'principal', 'admin'], read: true }
  ],
  meta: { seq: 164, docSeq: 8, auditSeq: 8, userSeq: 13, roleSeq: 4 }
};
DB.masters = Object.fromEntries(MASTER_DEFS.map(m => [m.key, [...m.items]]));
DB.school = DB.schools[0];

const CLASS_TEACHERS = {
  'Class 3|A': 'Sunita Rao', 'Class 4|A': 'Rohan Mehta', 'Class 5|A': 'Rohan Mehta',
  'Class 5|B': 'Farah Khan', 'Class 6|A': 'Deepak Joshi', 'Class 6|B': 'Priya Nair',
  'Class 7|A': 'Anita Bose', 'Class 8|B': 'Manish Gupta'
};
const STAFF_CLASSES = [['Class 4', 'A', 'Mathematics'], ['Class 5', 'A', 'Mathematics'], ['Class 6', 'B', 'Mathematics']];
const CT_CLASS = ['Class 5', 'A'];

const MALE = ['Aarav', 'Vivaan', 'Reyansh', 'Advik', 'Arjun', 'Dhruv', 'Ishaan', 'Rudra', 'Vihaan', 'Krish', 'Yuvraj', 'Ayaan', 'Atharv', 'Dev', 'Harsh', 'Om', 'Veer', 'Kabir', 'Aditya', 'Rohan'];
const FEMALE = ['Diya', 'Isha', 'Ananya', 'Myra', 'Saanvi', 'Kiara', 'Aadhya', 'Navya', 'Pari', 'Anvi', 'Mahi', 'Riya', 'Sara', 'Meera', 'Tara', 'Nitya', 'Prisha', 'Anika', 'Ira', 'Sneha'];
const LAST = ['Sharma', 'Patel', 'Singh', 'Verma', 'Gupta', 'Nair', 'Iyer', 'Mehta', 'Khan', 'Das', 'Reddy', 'Joshi', 'Chauhan', 'Bose', 'Yadav', 'Kapoor'];

function buildStudents() {
  const plan = [['Class 5', 'A', 18], ['Class 5', 'B', 20], ['Class 4', 'A', 22], ['Class 6', 'A', 22], ['Class 6', 'B', 20], ['Class 3', 'A', 22], ['Class 7', 'A', 22], ['Class 8', 'B', 18]];
  const cur = DB.sessions.find(s => s.current).name;
  let seq = 0;
  plan.forEach(([cls, sec, count]) => {
    const ci = DB.masters.classes.indexOf(cls);
    for (let r = 1; r <= count; r++) {
      seq++;
      const gender = seq % 2 ? 'Male' : 'Female';
      const surname = LAST[(seq * 5) % LAST.length];
      let name = (gender === 'Male' ? MALE[seq % MALE.length] : FEMALE[seq % FEMALE.length]) + ' ' + surname;
      let father = MALE[(seq * 3) % MALE.length] + ' ' + surname;
      let mother = FEMALE[(seq * 7) % FEMALE.length] + ' ' + surname;
      let siblings = 'No', siblingDetails = '';
      if (seq === 1) { name = 'Aarav Sharma'; father = 'Rakesh Sharma'; mother = 'Meera Sharma'; siblings = 'Yes'; siblingDetails = 'Diya Sharma (Class 5-A)'; }
      if (seq === 2) { name = 'Diya Sharma'; father = 'Rakesh Sharma'; mother = 'Meera Sharma'; siblings = 'Yes'; siblingDetails = 'Aarav Sharma (Class 5-A)'; }
      if (seq === 3) { name = 'Kabir Singh'; father = 'Harpreet Singh'; mother = 'Simran Singh'; }
      const dobYear = 2026 - (ci + 4);
      const dob = `${dobYear}-${pad((seq % 12) + 1)}-${pad((seq % 27) + 1)}`;
      const admYear = Math.min(2026, 2026 - Math.max(0, ci - 3));
      const prevCls = ci > 0 ? DB.masters.classes[ci - 1] : '';
      const enrollments = [];
      if (prevCls) {
        enrollments.push({ session: '2025-26', class: prevCls, section: sec, roll: String(r), result: 'Promoted' });
        if (ci > 1) enrollments.push({ session: '2024-25', class: DB.masters.classes[ci - 2], section: sec, roll: String(r), result: 'Promoted' });
      }
      enrollments.push({ session: cur, class: cls, section: sec, roll: String(r), result: 'Studying' });
      const archived = seq === 152 || seq === 153;
      const studentStatus = archived ? 'Active' : (seq % 23 === 0 ? 'TC Taken' : seq % 31 === 0 ? 'Drop Out' : 'Active');
      const admissionStatus = seq <= 3 ? 'Selection' : seq % 9 === 0 ? 'Payment Made' : seq % 13 === 0 ? 'Form Filled' : seq % 17 === 0 ? 'Called for Interaction' : seq % 29 === 0 ? 'Not Selected' : 'Selection';
      const clsNum = Math.max(1, ci - 2);
      DB.students.push({
        id: 'st' + seq, regNo: `SPS/2026/${pad(seq, 3)}`, admNo: `SPS/ADM/${pad(seq, 3)}`, penNo: `PEN${100000000 + seq * 17}`, apaarId: `94${String(1000000000 + seq * 29).slice(0, 10)}`, formNo: `FRM-${pad(seq, 4)}`,
        name, gender, dob, admissionDate: `${admYear}-04-${pad((seq % 20) + 1)}`, className: cls, section: sec, subSection: ci > 11 ? DB.masters.subSections[seq % 4] : '', rollNo: String(r),
        studentStatus, admissionStatus, house: DB.masters.houses[seq % 4], siblings, siblingDetails,
        mobile: `98${String(10000000 + (seq * 1379) % 89999999).slice(0, 8)}`, email: name.toLowerCase().replace(/[^a-z]+/g, '.') + '@example.com',
        state: seq % 11 === 0 ? 'Delhi' : 'Uttar Pradesh', district: seq % 11 === 0 ? 'New Delhi' : 'Agra', pincode: `2820${pad(seq % 10)}`, address: `${12 + seq} ${['Rose', 'Lotus', 'Maple', 'Cedar'][seq % 4]} Enclave, Sector ${(seq % 20) + 1}, ${seq % 11 === 0 ? 'New Delhi' : 'Agra'}`,
        socialCategory: DB.masters.socialCategories[seq % 5], caste: DB.masters.castes[seq % 5], religion: DB.masters.religions[seq % 7], motherTongue: DB.masters.languages[seq % 7], bloodGroup: DB.masters.bloodGroups[seq % 9], nationality: 'Indian', country: 'India',
        weight: String(24 + clsNum * 2 + (seq % 5)), height: String(118 + clsNum * 4 + (seq % 7)), disability: seq % 37 === 0 ? 'Yes' : 'No', minority: seq % 11 === 0 ? 'Yes' : 'No', bpl: seq % 13 === 0 ? 'Yes' : 'No', transport: ['School Bus', 'Private', 'Walking', 'Public Transport'][seq % 4], rte: seq % 7 === 0 ? 'Yes' : 'No', remarks: '',
        fatherName: father, fatherOccupation: DB.masters.occupations[seq % 7], fatherDepartment: DB.masters.departments[seq % 7], fatherDesignation: DB.masters.designations[seq % 7], fatherOrg: ['Agra Traders', 'Northline Services', 'Self Owned', 'Public Works'][seq % 4], fatherEmployee: `EMP-${2000 + seq}`, fatherOrgAddress: 'Civil Lines, Agra', fatherEmail: father.toLowerCase().replace(/[^a-z]+/g, '.') + '@example.com', fatherIncome: String(450000 + (seq % 8) * 50000), fatherOfficePhone: `0562-${2400000 + seq}`, fatherDob: `${1978 + (seq % 8)}-06-15`, fatherMobile: `97${String(10000000 + (seq * 2131) % 89999999).slice(0, 8)}`,
        motherName: mother, motherOccupation: seq % 3 === 0 ? 'Homemaker' : 'Service', motherDepartment: DB.masters.departments[(seq + 2) % 7], motherDesignation: DB.masters.designations[(seq + 3) % 7], motherOrg: 'Northline Services', motherEmployee: `EMP-${3000 + seq}`, motherOrgAddress: 'Sanjay Place, Agra', motherEmail: mother.toLowerCase().replace(/[^a-z]+/g, '.') + '@example.com', motherIncome: String(280000 + (seq % 5) * 40000), motherOfficePhone: `0562-${2500000 + seq}`, motherDob: `${1981 + (seq % 8)}-09-20`, motherMobile: `96${String(10000000 + (seq * 1877) % 89999999).slice(0, 8)}`,
        guardianName: seq % 4 === 0 ? 'Ram Prasad ' + surname : '', guardianRelation: seq % 4 === 0 ? 'Grandfather' : '', guardianContact: seq % 4 === 0 ? `95${String(10000000 + seq * 991).slice(0, 8)}` : '', guardianAddress: seq % 4 === 0 ? `${12 + seq} Rose Enclave, Agra` : '',
        prevSchoolName: ci > 2 ? ['Little Angels School', "St. Mary's Convent", 'City Montessori School'][seq % 3] : '', prevSchoolAddress: ci > 2 ? 'Agra, Uttar Pradesh' : '', prevSchoolBoard: ci > 2 ? DB.masters.boards[seq % 3] : '', prevSchoolPercentage: ci > 2 ? String(72 + (seq % 22)) : '', prevTcNo: ci > 2 ? `TC-${9000 + seq}` : '',
        photo: null, archived, createdAt: `${admYear}-04-04`, enrollments, history: []
      });
    }
  });
  DB.meta.seq = seq;
}
buildStudents();

const seedDocs = [
  ['Birth Certificate', 'st1', 'Birth_Certificate_Aarav.pdf', '2026-04-04', '412 KB'],
  ['Transfer Certificate', 'st1', 'Transfer_Certificate_Aarav.pdf', '2026-04-04', '286 KB'],
  ['Previous Report Card', 'st1', 'Report_Card_2025-26_Aarav.pdf', '2026-04-06', '640 KB'],
  ['Birth Certificate', 'st2', 'Birth_Certificate_Diya.pdf', '2026-04-04', '398 KB'],
  ['Medical Record', 'st3', 'Medical_Record_Kabir.pdf', '2026-04-07', '212 KB'],
  ['Address Proof', 'st4', 'Address_Proof_Saanvi.pdf', '2026-04-08', '510 KB'],
  ['Photograph', 'st5', 'Photograph_Ananya.jpg', '2026-04-08', '190 KB'],
  ['Transfer Certificate', 'st6', 'Transfer_Certificate_Reyansh.pdf', '2026-04-09', '274 KB']
];
DB.docs = seedDocs.map((d, i) => ({ id: 'doc' + (i + 1), type: d[0], studentId: d[1], name: d[2], date: d[3], size: d[4], by: 'Neha Verma', archived: false }));

const seedAudit = [
  ['2026-10-29 08:42', 'Anil Deshmukh', 'School Admin', 'Student Master', 'Updated student', 'Aarav Sharma (SPS/2026/001) - contact address updated'],
  ['2026-10-29 08:20', 'Neha Verma', 'School Office Staff', 'Admissions', 'Updated admission status', 'SPS/2026/013 moved to Payment Made'],
  ['2026-10-28 17:05', 'Anil Deshmukh', 'School Admin', 'Users & Roles', 'Created user', 'Front office operator account created'],
  ['2026-10-28 15:40', 'Rohan Mehta', 'Class Teacher', 'Verification Sheet', 'Verified class sheet', 'Class 5-A, 18 students marked verified'],
  ['2026-10-28 11:12', 'Anil Deshmukh', 'School Admin', 'Academic Sessions', 'Updated session', 'Session 2026-27 set as current'],
  ['2026-10-27 16:30', 'Kavita Rao', 'Super Admin', 'Schools', 'Edited school', 'Green Valley International details updated'],
  ['2026-10-27 10:05', 'Anil Deshmukh', 'School Admin', 'Documents', 'Uploaded document', 'Report_Card_2025-26_Aarav.pdf'],
  ['2026-10-26 09:15', 'Anil Deshmukh', 'School Admin', 'Student Master', 'Archived student', 'Inactive duplicate record archived']
];
DB.audit = seedAudit.map((a, i) => ({ id: 'a' + (i + 1), date: a[0], user: a[1], role: a[2], module: a[3], action: a[4], detail: a[5] }));

DB.users = [
  { id: 'u1', name: 'Anil Deshmukh', username: 'school.admin', mobile: '9810000009', role: 'admin', status: 'Active', last: 'Today, 08:42' },
  { id: 'u2', name: 'Priya Nair', username: 'priya.nair', mobile: '9810000001', role: 'teacher', status: 'Active', last: 'Today, 08:10' },
  { id: 'u3', name: 'Rohan Mehta', username: 'rohan.mehta', mobile: '9810000002', role: 'class_teacher', status: 'Active', last: 'Yesterday, 16:20' },
  { id: 'u4', name: 'Neha Verma', username: 'neha.verma', mobile: '9810000003', role: 'office', status: 'Active', last: 'Today, 07:55' },
  { id: 'u5', name: 'Suresh Yadav', username: 'suresh.yadav', mobile: '9810000004', role: 'staff', status: 'Active', last: '28 Oct 2026, 14:10' },
  { id: 'u6', name: 'Dr. Meera Kapoor', username: 'dr.kapoor', mobile: '9810000005', role: 'principal', status: 'Active', last: 'Today, 08:30' },
  { id: 'u7', name: 'Ashok Malhotra', username: 'a.malhotra', mobile: '9810000006', role: 'manager', status: 'Active', last: '27 Oct 2026, 11:05' },
  { id: 'u8', name: 'Rakesh Sharma', username: 'rakesh.sharma', mobile: '9810000007', role: 'parent', status: 'Active', last: '28 Oct 2026, 19:30' },
  { id: 'u9', name: 'Aarav Sharma', username: 'aarav.sharma', mobile: '9810000008', role: 'student', status: 'Active', last: '28 Oct 2026, 18:12' },
  { id: 'u10', name: 'Sunita Rao', username: 'sunita.rao', mobile: '9810000014', role: 'class_teacher', status: 'Active', last: '26 Oct 2026, 10:30' },
  { id: 'u11', name: 'Deepak Joshi', username: 'deepak.joshi', mobile: '9810000015', role: 'teacher', status: 'Disabled', last: '12 Oct 2026, 09:00' },
  { id: 'u12', name: 'Farah Khan', username: 'farah.khan', mobile: '9810000016', role: 'class_teacher', status: 'Active', last: '27 Oct 2026, 15:44' }
];

DB.roles = [
  { id: 'r1', name: 'School Admin', desc: 'Full school configuration, students and audit.', perms: ['View', 'Edit', 'Archive', 'Delete'], builtin: true },
  { id: 'r2', name: 'Principal', desc: 'School-wide read access and reports.', perms: ['View'], builtin: true },
  { id: 'r3', name: 'Class Teacher', desc: 'Assigned class, student verification and lists.', perms: ['View', 'Edit'], builtin: true },
  { id: 'r4', name: 'Office Operator', desc: 'Front office admissions and document access.', perms: ['View', 'Edit'], builtin: false }
];

/* ============================= application state ============================= */
const state = {
  user: null, view: 'dashboard', params: {},
  page: 1, size: 8,
  stu: { q: '', cls: '', sec: '', status: '', arch: '0' },
  masterKey: 'classes', masterQ: '',
  reportTab: 'strength', reportCls: '', reportSec: '',
  reportCols: ['regNo', 'name', 'className', 'section', 'gender', 'fatherName', 'mobile'],
  verCls: 'Class 5', verSec: 'A',
  photoCls: '', docQ: '', docType: '',
  auditQ: '', auditModule: '',
  admQ: '', admStatus: '',
  schoolForm: null, adminForm: false,
  moduleSchool: 'sch1',
  promoSrc: 'Class 5', promoSection: 'A', promoTarget: 'Class 6', promoTargetSession: '2027-28',
  loginRole: '', loginStep: 1, formPhoto: null
};
const PAGE_EXTRA = { 'student-detail': 'Student Profile', 'student-form': 'Student Form' };
let toastTimer = null, pendingConfirm = null;

/* ============================= toast + modal ============================= */
function toast(title, msg, type = 'success') {
  const el = $('#toast');
  el.className = 'toast show ' + (type === 'error' ? 'error' : type === 'info' ? 'info' : '');
  $('#toastTitle').textContent = title;
  $('#toastMsg').textContent = msg || '';
  $('#toastMark').textContent = type === 'error' ? '!' : type === 'info' ? 'i' : '✓';
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 4200);
}
function closeModal() { $('#modalRoot').innerHTML = ''; pendingConfirm = null; }
function confirmBox(title, message, onOk, options = {}) {
  const { ok = 'Confirm', danger = false } = options;
  pendingConfirm = onOk;
  $('#modalRoot').innerHTML = `<div class="modal-backdrop"><div class="modal" role="dialog" aria-modal="true" aria-label="${esc(title)}">
    <div class="modal-head"><span class="modal-ico ${danger ? 'danger' : ''}">${danger ? '!' : 'i'}</span><div><h3>${esc(title)}</h3><p>${message}</p></div></div>
    <div class="modal-foot"><button class="btn btn-outline" data-act="modal-cancel">Cancel</button><button class="btn ${danger ? 'btn-danger' : 'btn-primary'}" data-act="modal-ok">${esc(ok)}</button></div>
  </div></div>`;
}
function docsModal(student) {
  const docs = DB.docs.filter(d => d.studentId === student.id && !d.archived);
  $('#modalRoot').innerHTML = `<div class="modal-backdrop"><div class="modal" role="dialog" aria-modal="true">
    <div class="modal-head"><span class="modal-ico">${ic('folder')}</span><div><h3>Documents &middot; ${esc(student.name)}</h3><p>${esc(student.regNo)} &middot; ${docs.length} document(s) in the demo repository</p></div></div>
    <div class="modal-body">${docs.length ? `<div class="list">${docs.map(d => `<div class="list-item"><span class="doc-type">${esc((d.type || 'DOC').slice(0, 3))}</span><div><b>${esc(d.name)}</b><small>${esc(d.type)} &middot; ${esc(d.date)} &middot; ${esc(d.size)}</small></div><div class="r"><button class="link-btn" data-act="doc-dl" data-id="${d.id}">Download</button></div></div>`).join('')}</div>` : '<p class="empty"><b>No documents linked</b>Use the Document Repository to attach a demo document.</p>'}</div>
    <div class="modal-foot"><button class="btn btn-outline" data-act="modal-cancel">Close</button></div>
  </div></div>`;
}

/* ============================= login ============================= */
function initLogin() {
  $('#roleGrid').innerHTML = ROLE_KEYS.map(k => `<button type="button" class="role-option" data-role="${k}"><span class="dot"></span>${ROLES[k].label}</button>`).join('');
  $('#demoRows').innerHTML = ROLE_KEYS.map(k => `<tr><td>${ROLES[k].label}</td><td>${ROLES[k].username}</td><td>${ROLES[k].mobile}</td><td><button class="use" data-demo="${k}">Use</button></td></tr>`).join('');
  $('#loginForm').addEventListener('submit', e => { e.preventDefault(); loginSubmit(); });
  $('#changeUserBtn').addEventListener('click', () => resetLoginStep());
  $('#fillOtpBtn').addEventListener('click', () => { $('#otpInput').value = '123456'; $('#otpInput').focus(); $('#otpError').textContent = ''; });
  $('#resendBtn').addEventListener('click', () => toast('Demo OTP resent', 'Use 123456 again. No SMS or email is sent.', 'info'));
  $('#menuBtn').addEventListener('click', () => { $('#sidebar').classList.add('open'); $('#scrim').classList.add('show'); });
  $('#sidebarClose').addEventListener('click', closeSidebar);
  $('#scrim').addEventListener('click', closeSidebar);
  $('#toastClose').addEventListener('click', () => $('#toast').classList.remove('show'));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeModal(); closeSidebar(); } });
  try {
    const saved = sessionStorage.getItem('edunexus_role');
    if (saved && ROLES[saved]) startSession(saved, false);
  } catch (err) { /* file:// privacy mode may block storage */ }
}
function selectRole(role, fill) {
  state.loginRole = role;
  $$('.role-option').forEach(b => b.classList.toggle('on', b.dataset.role === role));
  const r = ROLES[role];
  $('#loginIdHint').innerHTML = `Demo login: <b>${r.username}</b> or <b>${r.mobile}</b>`;
  if (fill) $('#loginId').value = r.username;
}
function resetLoginStep() {
  state.loginStep = 1;
  $('#loginStepOne').classList.remove('hidden');
  $('#loginStepTwo').classList.add('hidden');
  $('#otpInput').value = ''; $('#otpError').textContent = ''; $('#loginError').textContent = '';
  $('#stepOneDot').className = 'step active';
  $('#stepTwoDot').className = 'step';
}
function loginSubmit() {
  if (state.loginStep === 1) {
    const err = $('#loginError'); err.textContent = '';
    if (!state.loginRole) { err.textContent = 'Select a role to continue.'; return; }
    const id = $('#loginId').value.trim().toLowerCase();
    if (!id) { err.textContent = 'Enter the username or mobile number.'; return; }
    const r = ROLES[state.loginRole];
    if (id !== r.username && id !== r.mobile) { err.textContent = `That credential does not match the ${r.label} demo account. Use ${r.username} or ${r.mobile}.`; return; }
    state.loginStep = 2;
    $('#loginStepOne').classList.add('hidden');
    $('#loginStepTwo').classList.remove('hidden');
    $('#otpTarget').textContent = `${r.label} · ${id}`;
    $('#otpInput').value = ''; $('#otpError').textContent = '';
    $('#stepOneDot').className = 'step done';
    $('#stepTwoDot').className = 'step active';
    setTimeout(() => $('#otpInput').focus(), 60);
    toast('Demo OTP sent', 'Enter 123456. No SMS is sent in this simulation.', 'info');
  } else {
    const otp = $('#otpInput').value.trim();
    if (!/^\d{6}$/.test(otp)) { $('#otpError').textContent = 'Enter the 6-digit demo OTP.'; return; }
    if (otp !== '123456') { $('#otpError').textContent = 'Incorrect demo OTP. Use 123456.'; return; }
    startSession(state.loginRole, true);
  }
}
function startSession(role, welcome) {
  state.user = Object.assign({ role }, ROLES[role]);
  state.view = 'dashboard'; state.params = {}; state.page = 1;
  state.stu = { q: '', cls: '', sec: '', status: '', arch: '0' };
  state.verCls = 'Class 5'; state.verSec = 'A';
  try { sessionStorage.setItem('edunexus_role', role); } catch (err) { /* ignore */ }
  $('#loginScreen').classList.add('hidden');
  $('#app').classList.remove('hidden');
  render();
  if (welcome) toast(`Signed in as ${ROLES[role].label}`, `${ROLES[role].name} · frontend simulation only.`);
}
function logout() {
  try { sessionStorage.removeItem('edunexus_role'); } catch (err) { /* ignore */ }
  state.user = null;
  $('#app').classList.add('hidden');
  $('#loginScreen').classList.remove('hidden');
  $('#loginId').value = '';
  state.loginRole = '';
  $$('.role-option').forEach(b => b.classList.remove('on'));
  resetLoginStep();
  closeSidebar();
  toast('Signed out', 'Demo session cleared.');
}
function closeSidebar() { $('#sidebar').classList.remove('open'); $('#scrim').classList.remove('show'); }

/* ============================= routing / shell ============================= */
function navItems() { return NAV[state.user.role].flatMap(g => g.items); }
function canView(v) {
  const items = navItems();
  if (items.some(i => i.v === v)) return true;
  if (v === 'student-detail') return items.some(i => i.v === 'students');
  if (v === 'student-form') return ['admin', 'office'].includes(state.user.role);
  return false;
}
function pageTitle() {
  if (state.view === 'student-form') return state.params.id ? 'Edit Student' : 'Add Student';
  const item = navItems().find(i => i.v === state.view);
  return item ? item.label : (PAGE_EXTRA[state.view] || 'Dashboard');
}
function go(view, params = {}) {
  if (!state.user) return;
  if (!VIEWS[view] || !canView(view)) { toast('Not available', 'This screen is outside your demo role scope.', 'error'); return; }
  if (state.view !== view) state.page = 1;
  state.view = view; state.params = params || {};
  if (view === 'student-form') state.formPhoto = params.id ? (byId(params.id)?.photo || null) : null;
  render();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
function render() {
  if (!state.user) return;
  const r = state.user.role;
  const schoolLabel = r === 'super' ? 'All Schools' : DB.school.name;
  const schoolSub = r === 'super' ? 'Multi-school control' : `${activeSchoolSession().name} session`;
  $('#sideSchool').innerHTML = `<span class="school-logo">${esc(r === 'super' ? 'SA' : DB.school.initials)}</span><div><b>${esc(schoolLabel)}</b><small>${esc(schoolSub)}</small></div><span class="chev">▾</span>`;
  $('#sideNav').innerHTML = NAV[r].map(g => `<div class="nav-label">${g.section}</div>` + g.items.map(i => {
    const on = state.view === i.v;
    return `<button class="nav-item ${on ? 'active' : ''}" data-act="nav" data-view="${i.v}"${i.id ? ` data-id="${i.id}"` : ''}>${ic(i.icon)}<span>${esc(i.label)}</span></button>`;
  }).join('')).join('');
  $('#sideUser').innerHTML = `${accountAvatar(state.user.name)}<div><b>${esc(state.user.name)}</b><small>${esc(state.user.label)}</small></div>`;
  $('#topUser').innerHTML = `${accountAvatar(state.user.name)}<div><b>${esc(state.user.name)}</b><small>${esc(state.user.label)}</small></div>`;
  $('#sessionChip').innerHTML = `Session <b>${esc(activeSchoolSession().name)}</b>`;
  $('#crumb').innerHTML = `School Management <span>/</span> <b>${esc(pageTitle())}</b>`;
  document.title = `${pageTitle()} | EduNexus`;
  const fn = VIEWS[state.view] || VIEWS.dashboard;
  try { $('#view').innerHTML = fn(state.params); }
  catch (err) { $('#view').innerHTML = `<div class="card card-pad"><b>Something went wrong rendering this demo screen.</b><p class="small muted">${esc(err.message)}</p></div>`; }
  closeSidebar();
}

/* ============================= shared UI helpers ============================= */
function pageHead(title, sub, actions = '') {
  return `<div class="page-head"><div><span class="eyebrow">SCHOOL MANAGEMENT PORTAL</span><h1>${esc(title)}</h1><p>${esc(sub)}</p></div><div class="page-actions">${actions}</div></div>`;
}
function printHead(title) {
  return `<div class="print-head"><h2>${esc(DB.school.name)}</h2><p>${esc(title)} · ${esc(activeSchoolSession().name)} · Generated ${esc(nowStamp())}</p></div>`;
}
function kpi(label, value, iconName, kind = '', note = '') {
  return `<div class="card stat-card"><div class="stat-icon ${kind}">${ic(iconName)}</div><div><small>${esc(label)}</small><b>${esc(value)}</b>${note ? `<span class="delta">${esc(note)}</span>` : ''}</div></div>`;
}
function heroCard(title, text, actions = [], meta = '') {
  return `<div class="hero-card"><h2>${esc(title)}</h2><p>${esc(text)}</p>${actions.length ? `<div class="row"><button class="btn btn-primary" data-act="nav" data-view="${actions[0].v}"${actions[0].id ? ` data-id="${actions[0].id}"` : ''}>${esc(actions[0].label)}</button>${actions.slice(1).map(a => `<button class="btn btn-outline" data-act="nav" data-view="${a.v}"${a.id ? ` data-id="${a.id}"` : ''}>${esc(a.label)}</button>`).join('')}</div>` : ''}${meta}</div>`;
}
function quickActions(items) {
  return `<div class="quick-grid">${items.map(a => `<button class="quick-action" data-act="nav" data-view="${a.v}"${a.id ? ` data-id="${a.id}"` : ''}><span class="qi">${ic(a.icon || 'arrow')}</span><span>${esc(a.label)}</span><small>${esc(a.sub || '')}</small></button>`).join('')}</div>`;
}
function acc(title, sub, body, open = false, iconName = 'id') {
  return `<details class="acc"${open ? ' open' : ''}><summary><span class="acc-ico">${ic(iconName, 'sm')}</span><span class="st"><b>${esc(title)}</b><small>${esc(sub)}</small></span><span class="chev">▾</span></summary><div class="acc-body">${body}</div></details>`;
}
function emptyBox(text, sub = '') { return `<div class="empty"><b>${esc(text)}</b>${sub ? esc(sub) : ''}</div>`; }
function mainStudents() { return DB.students.filter(s => !s.archived); }
function visibleStudents(includeArchived = false) {
  let list = DB.students;
  if (!includeArchived) list = list.filter(s => !s.archived);
  const r = state.user.role;
  if (r === 'teacher') list = list.filter(s => STAFF_CLASSES.some(c => c[0] === s.className && c[1] === s.section));
  if (r === 'class_teacher') list = list.filter(s => s.className === CT_CLASS[0] && s.section === CT_CLASS[1]);
  if (r === 'parent' || r === 'student') list = list.filter(s => s.id === 'st1');
  return list;
}
function filteredStudents() {
  const f = state.stu;
  let list = visibleStudents(f.arch === '1' && state.user.role === 'admin');
  if (f.q) list = filterList(list, f.q, ['name', 'regNo', 'admNo', 'mobile', 'fatherName', 'penNo']);
  if (f.cls) list = list.filter(s => s.className === f.cls);
  if (f.sec) list = list.filter(s => s.section === f.sec);
  if (f.status) list = list.filter(s => s.studentStatus === f.status);
  return list.sort((a, b) => classOrder(a.className) - classOrder(b.className) || a.section.localeCompare(b.section) || Number(a.rollNo) - Number(b.rollNo));
}
function classRows(list = mainStudents()) {
  const map = new Map();
  list.forEach(s => {
    const k = s.className + '|' + s.section;
    if (!map.has(k)) map.set(k, { cls: s.className, sec: s.section, total: 0, boys: 0, girls: 0, active: 0 });
    const o = map.get(k); o.total++; if (s.gender === 'Male') o.boys++; else if (s.gender === 'Female') o.girls++; if (s.studentStatus === 'Active') o.active++;
  });
  return [...map.values()].sort((a, b) => classOrder(a.cls) - classOrder(b.cls) || a.sec.localeCompare(b.sec));
}
function strengthBars(rows) {
  const max = Math.max(1, ...rows.map(r => r.total));
  return rows.map(r => `<div class="strength-row"><b>${esc(r.cls)} ${esc(r.sec)}</b><div class="bar"><span style="width:${Math.round(r.total / max * 100)}%"></span></div><span class="num">${r.total}</span></div>`).join('');
}
function pager(total) {
  const pages = Math.max(1, Math.ceil(total / state.size));
  const p = Math.min(state.page, pages);
  if (pages <= 1) return '';
  let btns = '';
  for (let i = 1; i <= pages; i++) {
    if (pages > 8 && i > 2 && i < pages - 1 && Math.abs(i - p) > 1) { if (i === 3) btns += '<span class="tiny muted" style="padding:0 4px">…</span>'; continue; }
    btns += `<button data-act="page" data-p="${i}" class="${i === p ? 'on' : ''}">${i}</button>`;
  }
  return `<div class="pager"><small>Showing ${(p - 1) * state.size + 1}–${Math.min(total, p * state.size)} of ${total} records</small><div class="pages"><button data-act="page" data-p="${p - 1}" ${p === 1 ? 'disabled' : ''}>‹</button>${btns}<button data-act="page" data-p="${p + 1}" ${p === pages ? 'disabled' : ''}>›</button></div></div>`;
}
function noticeList(limit = 4) {
  const list = DB.notices.filter(n => n.audience.includes(state.user.role)).slice(0, limit);
  return `<div class="list">${list.map(n => `<div class="list-item"><span class="stat-icon ${n.read ? '' : 'blue'}" style="width:30px;height:30px;border-radius:8px">${ic('bell', 'sm')}</span><div><b>${esc(n.title)}</b><small>${esc(fmtDate(n.date))} &middot; ${n.read ? 'Read' : 'Unread'}</small></div></div>`).join('') || emptyBox('No notices')}</div>`;
}
function studentLink(s) {
  return `<div class="t-name">${avatar(s)}<div><b>${esc(s.name)}</b><small>${esc(s.regNo)}</small></div></div>`;
}

function greeting() { const h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'; }
function sectionCard(title, sub, body, actions = '') {
  return `<div class="card table-card"><div class="table-head"><div><h3>${esc(title)}</h3>${sub ? `<p>${esc(sub)}</p>` : ''}</div>${actions}</div>${body}</div>`;
}
function pipeline(list) {
  const statuses = DB.masters.admissionStatuses;
  const max = Math.max(1, ...statuses.map(s => list.filter(x => x.admissionStatus === s).length));
  return `<div class="list">${statuses.map(s => { const n = list.filter(x => x.admissionStatus === s).length; return `<div class="strength-row"><b>${esc(s)}</b><div class="bar ${s === 'Selection' ? 'green' : s === 'Form Filled' ? 'amber' : ''}"><span style="width:${Math.round(n / max * 100)}%"></span></div><span class="num">${n}</span></div>`; }).join('')}</div>`;
}
function auditMini(limit = 5) {
  return `<div class="timeline">${DB.audit.slice(0, limit).map(a => `<div class="tl-item on"><b>${esc(a.action)}</b><small>${esc(a.user)} &middot; ${esc(a.module)}</small><p>${esc(a.detail)}</p></div>`).join('')}</div>`;
}
function dashboardView() {
  const role = state.user.role;
  const list = visibleStudents();
  const active = list.filter(s => s.studentStatus === 'Active').length;
  const tc = list.filter(s => s.studentStatus === 'TC Taken').length;
  const rows = classRows(role === 'teacher' || role === 'class_teacher' ? list : mainStudents());
  const cur = activeSchoolSession().name;
  if (role === 'teacher') {
    const mine = list.filter(s => s.studentStatus === 'Active').length;
    return pageHead('Dashboard', `${greeting()}, ${state.user.name}. Here are your assigned classes and students.`, `<button class="btn btn-outline" data-act="nav" data-view="classes">${ic('book', 'sm')} My Classes</button><button class="btn btn-primary" data-act="nav" data-view="students">${ic('users', 'sm')} Student List</button>`)
      + heroCard(`${greeting()}, ${state.user.name}`, `You have ${STAFF_CLASSES.length} assigned classes in session ${cur}. The next mathematics period is Class 6-B after the short break.`, [{ label: 'Open My Classes', v: 'classes' }, { label: 'Student Directory', v: 'students' }], `<div class="hero-meta"><div><b>${STAFF_CLASSES.length}</b><span>Assigned classes</span></div><div><b>${mine}</b><span>Active students</span></div><div><b>5</b><span>Periods today</span></div></div>`)
      + `<div class="grid g4 mt">${kpi('Assigned Students', mine, 'users', '', 'Across 3 classes')}${kpi('Classes Today', 5, 'calendar', 'blue', 'Next: 11:20 AM')}${kpi('Attendance (demo)', '94%', 'checks', 'green', 'Class average')}${kpi('Pending Tasks', 2, 'file', 'amber', 'Marks & notices')}</div>`
      + `<div class="grid g-2-1 mt"><div class="stack">${sectionCard('My Classes', 'Assigned teaching groups', `<div class="table-wrap"><table class="data"><thead><tr><th>Class</th><th>Subject</th><th>Students</th><th>Class Teacher</th><th></th></tr></thead><tbody>${STAFF_CLASSES.map(c => { const n = mainStudents().filter(s => s.className === c[0] && s.section === c[1]).length; return `<tr><td><b>${c[0]} ${c[1]}</b></td><td>${c[2]}</td><td>${n}</td><td>${esc(CLASS_TEACHERS[c[0] + '|' + c[1]] || '—')}</td><td class="right"><button class="link-btn" data-act="class-list" data-cls="${c[0]}" data-sec="${c[1]}">View list</button></td></tr>`; }).join('')}</tbody></table></div>`)}${sectionCard('Notices', 'Latest for teaching staff', `<div class="card-pad">${noticeList(3)}</div>`, `<button class="link-btn" data-act="nav" data-view="notices">View all</button>`)}</div>`
      + `<div class="stack">${sectionCard('Today\'s Schedule', 'Period summary (demo)', `<div class="card-pad"><div class="timeline"><div class="tl-item on"><b>Class 5-A · Mathematics</b><small>09:00 – 09:45 &middot; Room 204</small></div><div class="tl-item on"><b>Class 4-A · Mathematics</b><small>10:30 – 11:15 &middot; Room 108</small></div><div class="tl-item on"><b>Class 6-B · Mathematics</b><small>11:20 – 12:05 &middot; Room 301</small></div><div class="tl-item"><b>Free period · Planning</b><small>12:05 – 12:50</small></div><div class="tl-item"><b>Class 5-A · Remedial</b><small>02:00 – 02:40 &middot; Room 204</small></div></div></div>`)}${sectionCard('Quick Actions', '', `<div class="card-pad">${quickActions([{ label: 'My Classes', sub: '3 assigned', v: 'classes', icon: 'book' }, { label: 'Student List', sub: 'View records', v: 'students', icon: 'users' }, { label: 'Notices', sub: '2 unread', v: 'notices', icon: 'bell' }, { label: 'My Profile', sub: 'Account details', v: 'profile', icon: 'user' }])}</div>`)}</div></div>`;
  }
  if (role === 'class_teacher') {
    const clsList = list;
    return pageHead('Class Teacher Dashboard', `${greeting()}, ${state.user.name}. Class 5-A overview for ${cur}.`, `<button class="btn btn-outline" data-act="nav" data-view="verification">${ic('checks', 'sm')} Verification Sheet</button><button class="btn btn-primary" data-act="nav" data-view="students">Class List</button>`)
      + heroCard(`Class 5-A · ${greeting()}`, `You are the class teacher for Class 5-A. Share the verification sheet with students for correctness before the Friday deadline.`, [{ label: 'Open Verification Sheet', v: 'verification' }, { label: 'Class Student List', v: 'students' }], `<div class="hero-meta"><div><b>${clsList.length}</b><span>Class strength</span></div><div><b>${clsList.filter(s => s.gender === 'Male').length}</b><span>Boys</span></div><div><b>${clsList.filter(s => s.gender === 'Female').length}</b><span>Girls</span></div><div><b>Pending</b><span>Verification</span></div></div>`)
      + `<div class="grid g4 mt">${kpi('Class Strength', clsList.length, 'users', '', 'Class 5-A')}${kpi('Active Students', active, 'checks', 'green', 'In current session')}${kpi('Sibling Records', clsList.filter(s => s.siblings === 'Yes').length, 'layers', 'blue', 'Linked siblings')}${kpi('Verification', 'Pending', 'file', 'amber', 'Due Friday')}</div>`
      + `<div class="grid g-2-1 mt"><div class="stack">${sectionCard('Class 5-A Students', 'Verification-ready class list', `<div class="table-wrap"><table class="data"><thead><tr><th>Roll</th><th>Student</th><th>Father</th><th>Mobile</th><th>Status</th><th></th></tr></thead><tbody>${clsList.slice(0, 8).map(s => `<tr><td>${esc(s.rollNo)}</td><td>${studentLink(s)}</td><td>${esc(s.fatherName)}</td><td>${esc(s.mobile)}</td><td>${statusPill(s.studentStatus)}</td><td class="right"><button class="link-btn" data-act="view-student" data-id="${s.id}">View</button></td></tr>`).join('')}</tbody></table></div>`, `<button class="link-btn" data-act="nav" data-view="students">View all ${clsList.length}</button>`)}${sectionCard('Notices', 'Class-relevant updates', `<div class="card-pad">${noticeList(3)}</div>`)}</div>`
      + `<div class="stack">${sectionCard('Class Snapshot', 'Class 5-A', `<div class="card-pad"><div class="strength-row"><b>Boys</b><div class="bar"><span style="width:${Math.round(clsList.filter(s => s.gender === 'Male').length / Math.max(1, clsList.length) * 100)}%"></span></div><span class="num">${clsList.filter(s => s.gender === 'Male').length}</span></div><div class="strength-row"><b>Girls</b><div class="bar green"><span style="width:${Math.round(clsList.filter(s => s.gender === 'Female').length / Math.max(1, clsList.length) * 100)}%"></span></div><span class="num">${clsList.filter(s => s.gender === 'Female').length}</span></div><div class="divider"></div><div class="profile-rows"><div><span>Class Teacher</span><b>${esc(state.user.name)}</b></div><div><span>Session</span><b>${esc(cur)}</b></div><div><span>Verification due</span><b>Friday</b></div></div></div>`)}${sectionCard('Quick Actions', '', `<div class="card-pad">${quickActions([{ label: 'Verification', sub: 'Print sheet', v: 'verification', icon: 'checks' }, { label: 'Class List', sub: '18 students', v: 'students', icon: 'users' }, { label: 'Notices', sub: 'View updates', v: 'notices', icon: 'bell' }, { label: 'My Profile', sub: 'Account', v: 'profile', icon: 'user' }])}</div>`)}</div></div>`;
  }
  if (role === 'office') {
    const pending = list.filter(s => s.admissionStatus !== 'Selection' && s.admissionStatus !== 'Not Selected');
    return pageHead('Front Office Dashboard', `${greeting()}, ${state.user.name}. Student records, admissions and document access.`, `<button class="btn btn-outline" data-act="nav" data-view="documents">${ic('folder', 'sm')} Documents</button><button class="btn btn-primary" data-act="nav" data-view="admissions">Admissions</button>`)
      + heroCard(`${greeting()}, ${state.user.name}`, `There are ${pending.length} admission records awaiting an update. Document access is available from each student record. Front-office permissions are provisional in this demo.`, [{ label: 'Open Admissions', v: 'admissions' }, { label: 'Student Records', v: 'students' }, { label: 'Document Access', v: 'documents' }])
      + `<div class="grid g4 mt">${kpi('Student Records', list.length, 'users', '', 'Active records')}${kpi('Admission Follow-ups', pending.length, 'layers', 'amber', 'Needs status update')}${kpi('Documents', DB.docs.filter(d => !d.archived).length, 'folder', 'blue', 'In repository')}${kpi('New This Session', list.filter(s => s.admissionDate >= '2026-04-01').length, 'trend', 'green', '2026-27 admissions')}</div>`
      + `<div class="grid g2 mt">${sectionCard('Admission Pipeline', 'Counts by admission status', `<div class="card-pad">${pipeline(list)}</div>`, `<button class="link-btn" data-act="nav" data-view="admissions">Open</button>`)}${sectionCard('Recent Admission Records', 'Latest records to review', `<div class="table-wrap"><table class="data"><thead><tr><th>Student</th><th>Class</th><th>Status</th><th>Documents</th></tr></thead><tbody>${list.filter(s => s.admissionStatus !== 'Selection').slice(0, 5).map(s => `<tr><td>${studentLink(s)}</td><td>${esc(s.className)} ${esc(s.section)}</td><td>${statusPill(s.admissionStatus)}</td><td><button class="link-btn" data-act="view-docs" data-id="${s.id}">View</button></td></tr>`).join('') || '<tr><td colspan="4" class="empty">No pending admissions</td></tr>'}</tbody></table></div>`)}</div>`
      + `<div class="grid g-2-1 mt"><div class="stack">${sectionCard('Notices', 'Front-office updates', `<div class="card-pad">${noticeList(3)}</div>`)}</div><div class="stack">${sectionCard('Quick Actions', 'Provisional access', `<div class="card-pad">${quickActions([{ label: 'Admissions', sub: 'Pipeline', v: 'admissions', icon: 'layers' }, { label: 'Student Records', sub: 'Search & view', v: 'students', icon: 'users' }, { label: 'Documents', sub: 'Repository', v: 'documents', icon: 'folder' }, { label: 'Notices', sub: 'Read', v: 'notices', icon: 'bell' }])}</div>`)}</div></div>`;
  }
  if (role === 'staff') {
    return pageHead('Staff Landing', `${greeting()}, ${state.user.name}. A role-appropriate landing page for non-teaching staff.`, `<button class="btn btn-outline" data-act="nav" data-view="profile">My Profile</button>`)
      + heroCard(`${greeting()}, ${state.user.name}`, `This is a minimal demo landing page for other non-teaching staff. Detailed module permissions are marked provisional in the SOW.`, [{ label: 'View My Profile', v: 'profile' }, { label: 'Notices', v: 'notices' }])
      + `<div class="grid g2 mt"><div class="stack">${sectionCard('My Workspace', 'Duties for today (demo)', `<div class="card-pad"><div class="timeline"><div class="tl-item on"><b>Main gate coordination</b><small>07:45 – 08:30</small><p>Support front office with morning arrival.</p></div><div class="tl-item on"><b>Transport desk</b><small>13:30 – 14:15</small><p>Confirm afternoon bus routes with drivers.</p></div><div class="tl-item"><b>Inventory check</b><small>15:00 – 16:00</small><p>Sports store, ground floor.</p></div></div></div>`)}${sectionCard('Notices', 'School-wide updates', `<div class="card-pad">${noticeList(3)}</div>`)}</div><div class="stack">${sectionCard('Profile Summary', 'Demo account', `<div class="card-pad"><div class="profile-rows"><div><span>Name</span><b>${esc(state.user.name)}</b></div><div><span>Role</span><b>Other Non-teaching Staff</b></div><div><span>School</span><b>${esc(DB.school.name)}</b></div><div><span>Access</span><b>${pill('Provisional', 'amber')}</b></div></div><div class="notice warn mt-s"><span class="mark">i</span><div>Module permissions are provisional and must be confirmed by the project owner.</div></div></div>`)}</div></div>`;
  }
  if (role === 'principal' || role === 'manager') {
    const isManager = role === 'manager';
    return pageHead(isManager ? 'Manager Dashboard' : 'Principal Dashboard', isManager ? 'School overview and authorized summary reports. Permissions are provisional.' : 'School-wide overview, student strength and available reports.', `<button class="btn btn-outline" data-act="nav" data-view="reports">${ic('chart', 'sm')} ${isManager ? 'Summary Reports' : 'Reports'}</button><button class="btn btn-primary" data-act="nav" data-view="students">Student Directory</button>`)
      + heroCard(`${greeting()}, ${state.user.name}`, `${DB.school.name} has ${active} active students in ${cur}. ${isManager ? 'Your summary view is provisional and limited to authorized reports.' : 'Review class strength and available reports below.'}`, [{ label: isManager ? 'Summary Reports' : 'View Reports', v: 'reports' }, { label: 'Student Directory', v: 'students' }])
      + `<div class="grid g4 mt">${kpi('Total Strength', list.length, 'users', '', 'All active records')}${kpi('Active Students', active, 'checks', 'green', 'Current status')}${kpi('Classes & Sections', rows.length, 'book', 'blue', 'Running groups')}${kpi('New Admissions', list.filter(s => s.admissionDate >= '2026-04-01').length, 'trend', 'amber', 'This session')}</div>`
      + `<div class="grid g-2-1 mt"><div class="stack">${sectionCard('Class / Section Strength', 'Current session overview', `<div class="card-pad">${strengthBars(rows)}</div>`, `<button class="link-btn" data-act="nav" data-view="reports">Full report</button>`)}${sectionCard('Recent Admissions', 'Latest student records', `<div class="table-wrap"><table class="data"><thead><tr><th>Student</th><th>Class</th><th>Admission Date</th><th>Status</th></tr></thead><tbody>${list.slice().sort((a, b) => b.admissionDate.localeCompare(a.admissionDate)).slice(0, 6).map(s => `<tr><td>${studentLink(s)}</td><td>${esc(s.className)} ${esc(s.section)}</td><td>${esc(fmtDate(s.admissionDate))}</td><td>${statusPill(s.studentStatus)}</td></tr>`).join('')}</tbody></table></div>`)}</div>`
      + `<div class="stack">${sectionCard('Gender Distribution', 'School-wide', `<div class="card-pad"><div class="strength-row"><b>Boys</b><div class="bar"><span style="width:${Math.round(list.filter(s => s.gender === 'Male').length / Math.max(1, list.length) * 100)}%"></span></div><span class="num">${list.filter(s => s.gender === 'Male').length}</span></div><div class="strength-row"><b>Girls</b><div class="bar green"><span style="width:${Math.round(list.filter(s => s.gender === 'Female').length / Math.max(1, list.length) * 100)}%"></span></div><span class="num">${list.filter(s => s.gender === 'Female').length}</span></div><div class="divider"></div><div class="profile-rows"><div><span>TC Taken</span><b>${tc}</b></div><div><span>Drop Out</span><b>${list.filter(s => s.studentStatus === 'Drop Out').length}</b></div><div><span>Session</span><b>${esc(cur)}</b></div></div></div>`)}${sectionCard('Available Reports', isManager ? 'Authorized summary only' : 'MIS access', `<div class="card-pad">${quickActions([{ label: 'Class Strength', sub: 'Full report', v: 'reports', icon: 'chart' }, { label: 'Student Directory', sub: 'Read-only', v: 'students', icon: 'users' }, { label: 'Verification', sub: 'View sheets', v: 'verification', icon: 'checks' }, { label: 'Notices', sub: 'Updates', v: 'notices', icon: 'bell' }])}${isManager ? '<div class="notice warn mt-s" style="margin-bottom:0"><span class="mark">i</span><div>Manager report scope is provisional in this demo.</div></div>' : ''}</div>`)}</div></div>`;
  }
  if (role === 'parent') {
    const child = byId('st1');
    return pageHead('Parent Dashboard', `Linked child profile and school updates for ${state.user.name}.`, `<button class="btn btn-outline" data-act="nav" data-view="documents">Documents</button><button class="btn btn-primary" data-act="nav" data-view="student-detail" data-id="st1">Child Profile</button>`)
      + `<div class="grid g-1-2"><div class="stack"><div class="card profile-card"><div class="profile-cover"></div><div class="profile-main">${avatar(child)}<h2>${esc(child.name)}</h2><p>${esc(child.regNo)} &middot; ${esc(child.className)} ${esc(child.section)}</p>${statusPill(child.studentStatus)}</div><div class="profile-meta"><div><span>Session</span><b>${esc(cur)}</b></div><div><span>Roll No.</span><b>${esc(child.rollNo)}</b></div><div><span>Attendance</span><b>94% (demo)</b></div><div><span>Fee status</span><b>Paid</b></div></div><div class="profile-rows"><div><span>Father</span><b>${esc(child.fatherName)}</b></div><div><span>Mother</span><b>${esc(child.motherName)}</b></div><div><span>Class Teacher</span><b>${esc(CLASS_TEACHERS['Class 5|A'])}</b></div><div><span>House</span><b>${esc(child.house)}</b></div></div></div>${sectionCard('Quick Actions', '', `<div class="card-pad">${quickActions([{ label: 'Child Profile', sub: 'Full details', v: 'student-detail', id: 'st1', icon: 'id' }, { label: 'Documents', sub: 'View repository', v: 'documents', icon: 'folder' }, { label: 'Notices', sub: 'School updates', v: 'notices', icon: 'bell' }, { label: 'My Profile', sub: 'Parent account', v: 'profile', icon: 'user' }])}</div>`)}</div>
      <div class="stack"><div class="grid g2">${kpi('Attendance', '94%', 'checks', 'green', 'This term (demo)')}${kpi('Fee Status', 'Paid', 'file', 'blue', 'No dues')}</div>${sectionCard('Student Details', 'Linked record', `<div class="card-pad"><div class="kv">${kv('Date of Birth', fmtDate(child.dob))}${kv('Blood Group', child.bloodGroup)}${kv('Admission Date', fmtDate(child.admissionDate))}${kv('Mobile', child.mobile)}${kv('Address', child.address)}${kv('Sibling', child.siblingDetails || '—')}</div><div class="row mt"><button class="btn btn-soft btn-sm" data-act="nav" data-view="student-detail" data-id="st1">Full student profile ${ic('arrow', 'sm')}</button></div></div>`)}${sectionCard('Upcoming at School', 'Demo events', `<div class="card-pad"><div class="timeline"><div class="tl-item on"><b>Parent-Teacher Meeting</b><small>08 Nov 2026 &middot; 09:00 AM</small><p>Meet the Class 5-A teacher in Room 204.</p></div><div class="tl-item on"><b>Half-yearly examinations</b><small>16 Nov 2026</small><p>Schedule shared by the class teacher.</p></div><div class="tl-item"><b>Annual sports day</b><small>12 Dec 2026</small><p>Details to follow.</p></div></div></div>`)}${sectionCard('Notices', 'School communication', `<div class="card-pad">${noticeList(3)}</div>`, `<button class="link-btn" data-act="nav" data-view="notices">View all</button>`)}</div></div>`;
  }
  if (role === 'student') {
    const me = byId('st1');
    return pageHead('Student Dashboard', `Your profile and class information for ${cur}.`, `<button class="btn btn-primary" data-act="nav" data-view="student-detail" data-id="st1">View My Profile</button>`)
      + heroCard(`${greeting()}, ${me.name.split(' ')[0]}`, `You are in ${me.className}-${me.section}, roll number ${me.rollNo}, for session ${cur}. Your class teacher is ${CLASS_TEACHERS['Class 5|A']}.`, [{ label: 'My Profile', v: 'student-detail', id: 'st1' }, { label: 'Notices', v: 'notices' }], `<div class="hero-meta"><div><b>${esc(me.className)}-${esc(me.section)}</b><span>Class</span></div><div><b>${esc(me.rollNo)}</b><span>Roll number</span></div><div><b>${esc(cur)}</b><span>Session</span></div><div><b>${esc(me.house)}</b><span>House</span></div></div>`)
      + `<div class="grid g4 mt">${kpi('Attendance', '96%', 'checks', 'green', 'This term (demo)')}${kpi('Class', `${me.className}-${me.section}`, 'book', 'blue', 'Current section')}${kpi('Roll Number', me.rollNo, 'id', '', 'Class 5-A')}${kpi('Pending Work', 1, 'file', 'amber', 'Demo task')}</div>`
      + `<div class="grid g-2-1 mt"><div class="stack">${sectionCard('My Class Details', 'Academic session and class', `<div class="card-pad"><div class="kv">${kv('Class Teacher', CLASS_TEACHERS['Class 5|A'])}${kv('Academic Session', cur)}${kv('Class / Section', `${me.className} / ${me.section}`)}${kv('Roll Number', me.rollNo)}${kv('House', me.house)}${kv('Admission Date', fmtDate(me.admissionDate))}</div></div>`)}${sectionCard('Notices', 'For students', `<div class="card-pad">${noticeList(3)}</div>`, `<button class="link-btn" data-act="nav" data-view="notices">View all</button>`)}</div><div class="stack">${sectionCard('Today\'s Timetable', 'Demo periods', `<div class="card-pad"><div class="timeline"><div class="tl-item on"><b>Mathematics</b><small>09:00 – 09:45 &middot; Priya Nair</small></div><div class="tl-item on"><b>English</b><small>09:50 – 10:35 &middot; Rohan Mehta</small></div><div class="tl-item on"><b>Science</b><small>10:30 – 11:15 &middot; Deepak Joshi</small></div><div class="tl-item"><b>Computer Lab</b><small>11:20 – 12:05</small></div><div class="tl-item"><b>Physical Education</b><small>02:00 – 02:40</small></div></div></div>`)}${sectionCard('My Details', 'At a glance', `<div class="card-pad"><div class="profile-rows"><div><span>Student ID</span><b>${esc(me.regNo)}</b></div><div><span>Blood Group</span><b>${esc(me.bloodGroup)}</b></div><div><span>Date of Birth</span><b>${esc(fmtDate(me.dob))}</b></div><div><span>Status</span><b>${statusPill(me.studentStatus)}</b></div></div></div>`)}</div></div>`;
  }
  if (role === 'admin') {
    return pageHead('School Admin Dashboard', `${DB.school.name} · session ${cur}. Complete Student Master and administration overview.`, `<button class="btn btn-outline" data-act="nav" data-view="audit">${ic('clock', 'sm')} Audit Trail</button><button class="btn btn-primary" data-act="nav" data-view="student-form">${ic('plus', 'sm')} Add Student</button>`)
      + heroCard(`${greeting()}, ${state.user.name}`, `Manage Student Master, promotions, masters, reports and audit for ${DB.school.name}. This is a frontend-only prototype using fictional records.`, [{ label: 'Add Student', v: 'student-form' }, { label: 'Student Master', v: 'students' }, { label: 'Promotion', v: 'promotion' }], `<div class="hero-meta"><div><b>${list.length}</b><span>Student records</span></div><div><b>${active}</b><span>Active</span></div><div><b>${rows.length}</b><span>Class groups</span></div><div><b>${DB.docs.filter(d => !d.archived).length}</b><span>Documents</span></div></div>`)
      + `<div class="grid g4 mt">${kpi('Total Students', list.length, 'users', '', '+12 this session')}${kpi('Active Students', active, 'checks', 'green', 'Current status')}${kpi('TC Taken', tc, 'archive', 'amber', 'Archived from active rolls')}${kpi('Audit Events', DB.audit.length, 'shield', 'blue', 'Restricted visibility')}</div>`
      + `<div class="grid g-3-1 mt"><div class="stack">${sectionCard('Class / Section Strength', 'Current session', `<div class="card-pad">${strengthBars(rows)}</div>`, `<button class="link-btn" data-act="nav" data-view="reports">Open reports</button>`)}${sectionCard('Admission Pipeline', 'Student Master admission statuses', `<div class="card-pad">${pipeline(list)}</div>`, `<button class="link-btn" data-act="nav" data-view="admissions">Open pipeline</button>`)}</div><div class="stack">${sectionCard('Quick Actions', 'Administration shortcuts', `<div class="card-pad">${quickActions([{ label: 'Add Student', sub: 'New record', v: 'student-form', icon: 'plus' }, { label: 'Promotion', sub: 'Next session', v: 'promotion', icon: 'trend' }, { label: 'Masters', sub: '19 masters', v: 'masters', icon: 'layers' }, { label: 'Reports & MIS', sub: 'Strength / UDISE', v: 'reports', icon: 'chart' }, { label: 'Users & Roles', sub: 'Access control', v: 'users', icon: 'shield' }, { label: 'Audit Trail', sub: 'Restricted', v: 'audit', icon: 'clock' }])}</div>`)}${sectionCard('Recent Audit Events', 'Most recent demo actions', `<div class="card-pad">${auditMini(5)}</div>`, `<button class="link-btn" data-act="nav" data-view="audit">View all</button>`)}</div></div>`
      + sectionCard('Recently Updated Students', 'Latest records in Student Master', `<div class="table-wrap"><table class="data"><thead><tr><th>Student</th><th>Class</th><th>Admission Status</th><th>Student Status</th><th>Admission Date</th><th></th></tr></thead><tbody>${list.slice(0, 6).map(s => `<tr><td>${studentLink(s)}</td><td>${esc(s.className)} ${esc(s.section)}</td><td>${statusPill(s.admissionStatus)}</td><td>${statusPill(s.studentStatus)}</td><td>${esc(fmtDate(s.admissionDate))}</td><td class="right"><button class="link-btn" data-act="view-student" data-id="${s.id}">Open</button></td></tr>`).join('')}</tbody></table></div>`, `<button class="link-btn" data-act="nav" data-view="students">All students</button>`);
  }
  // super admin
  const activeSchools = DB.schools.filter(s => s.status === 'active').length;
  const totalStudents = DB.schools.reduce((n, s) => n + (s.id === 'sch1' ? mainStudents().length : s.students), 0);
  return pageHead('Super Admin Dashboard', 'Multi-school oversight, module configuration and School Admin management.', `<button class="btn btn-outline" data-act="nav" data-view="audit">Audit Trail</button><button class="btn btn-primary" data-act="nav" data-view="schools">Manage Schools</button>`)
    + heroCard(`${greeting()}, ${state.user.name}`, `You oversee ${DB.schools.length} schools under the EduNexus umbrella. Create, edit or archive schools and manage School Admins in this demo.`, [{ label: 'Schools', v: 'schools' }, { label: 'School Admins', v: 'admins' }, { label: 'Module Configuration', v: 'modules' }], `<div class="hero-meta"><div><b>${DB.schools.length}</b><span>Schools</span></div><div><b>${activeSchools}</b><span>Active</span></div><div><b>${totalStudents}</b><span>Students</span></div><div><b>${DB.admins.length}</b><span>School Admins</span></div></div>`)
    + `<div class="grid g4 mt">${kpi('Schools', DB.schools.length, 'building', '', `${activeSchools} active`)}${kpi('Total Students', totalStudents, 'users', 'blue', 'Across schools')}${kpi('School Admins', DB.admins.filter(a => a.status === 'Active').length, 'shield', 'green', 'Active accounts')}${kpi('Archived Schools', DB.schools.filter(s => s.status === 'archived').length, 'archive', 'amber', 'Removed from usage')}</div>`
    + `<div class="grid g-3-1 mt"><div class="stack">${sectionCard('Schools', 'Under the EduNexus umbrella', `<div class="table-wrap"><table class="data"><thead><tr><th>School</th><th>Code</th><th>City</th><th>Students</th><th>Status</th><th></th></tr></thead><tbody>${DB.schools.map(s => `<tr><td><b>${esc(s.name)}</b><small class="muted">${esc(s.email)}</small></td><td>${esc(s.code)}</td><td>${esc(s.city)}</td><td>${s.id === 'sch1' ? mainStudents().length : s.students}</td><td>${s.status === 'active' ? pill('Active', 'green') : pill('Archived', 'grey')}</td><td class="right"><button class="link-btn" data-act="school-edit" data-id="${s.id}">Edit</button></td></tr>`).join('')}</tbody></table></div>`, `<button class="link-btn" data-act="nav" data-view="schools">Manage all</button>`)}${sectionCard('Recent Audit Events', 'Across demo schools', `<div class="card-pad">${auditMini(5)}</div>`, `<button class="link-btn" data-act="nav" data-view="audit">View all</button>`)}</div><div class="stack">${sectionCard('Module Configuration', 'Selected modules per school', `<div class="card-pad"><div class="list">${MODULE_DEFS.slice(0, 6).map(m => `<div class="list-item"><div><b>${esc(m[1])}</b><small>Enabled for 3 of 4 schools</small></div><div class="r">${pill('Active', 'green')}</div></div>`).join('')}</div></div>`, `<button class="link-btn" data-act="nav" data-view="modules">Configure</button>`)}${sectionCard('School Admins', 'Active accounts', `<div class="card-pad"><div class="list">${DB.admins.slice(0, 4).map(a => `<div class="list-item">${accountAvatar(a.name)}<div><b>${esc(a.name)}</b><small>${esc(a.email)}</small></div><div class="r">${a.status === 'Active' ? pill('Active', 'green') : pill('Disabled', 'grey')}</div></div>`).join('')}</div></div>`, `<button class="link-btn" data-act="nav" data-view="admins">Manage</button>`)}</div></div>`;
}

/* ============================= classes ============================= */
function classesView() {
  const role = state.user.role;
  const list = visibleStudents();
  const rows = classRows(role === 'teacher' || role === 'class_teacher' ? list : mainStudents());
  const actions = role === 'admin' ? `<button class="btn btn-outline" data-act="nav" data-view="masters">${ic('layers', 'sm')} Manage Masters</button><button class="btn btn-primary" data-act="nav" data-view="reports">${ic('chart', 'sm')} Strength Report</button>` : `<button class="btn btn-primary" data-act="nav" data-view="students">Student List</button>`;
  let body;
  if (role === 'class_teacher') {
    body = `<div class="grid g-1-2"><div class="card profile-card"><div class="profile-cover"></div><div class="profile-main"><span class="avatar" style="width:70px;height:70px;font-size:22px">5A</span><h2>Class 5-A</h2><p>Class teacher: ${esc(state.user.name)}</p>${pill('Current session ' + activeSchoolSession().name, 'violet')}</div><div class="profile-meta"><div><span>Strength</span><b>${list.length}</b></div><div><span>Active</span><b>${list.filter(s => s.studentStatus === 'Active').length}</b></div><div><span>Boys</span><b>${list.filter(s => s.gender === 'Male').length}</b></div><div><span>Girls</span><b>${list.filter(s => s.gender === 'Female').length}</b></div></div><div class="profile-rows"><div><span>Verification</span><b>${pill('Pending', 'amber')}</b></div><div><span>Room</span><b>204</b></div><div><span>Class strength</span><b>${list.length} students</b></div></div></div><div class="stack">${sectionCard('Class 5-A Student List', 'Verification-ready roster', `<div class="table-wrap"><table class="data"><thead><tr><th>Roll</th><th>Student</th><th>Father</th><th>Mother</th><th>Mobile</th><th></th></tr></thead><tbody>${list.slice(0, 10).map(s => `<tr><td>${esc(s.rollNo)}</td><td>${studentLink(s)}</td><td>${esc(s.fatherName)}</td><td>${esc(s.motherName)}</td><td>${esc(s.mobile)}</td><td class="right"><button class="link-btn" data-act="view-student" data-id="${s.id}">View</button></td></tr>`).join('')}</tbody></table></div>`, `<button class="link-btn" data-act="nav" data-view="students">View all</button>`)}${sectionCard('Verification Sheet', 'Share with students for correctness', `<div class="card-pad"><p class="report-note">The verification sheet lists personal, parent and contact information. Print it, collect signatures and confirm verification.</p><button class="btn btn-primary btn-sm" data-act="nav" data-view="verification">${ic('checks', 'sm')} Open verification sheet</button></div>`)}</div></div>`;
  } else if (role === 'teacher') {
    body = `<div class="grid g3">${STAFF_CLASSES.map(c => { const n = mainStudents().filter(s => s.className === c[0] && s.section === c[1]).length; return `<div class="card card-pad"><div class="row between"><span class="stat-icon">${ic('book')}</span>${pill('Assigned', 'violet')}</div><h3 style="margin:12px 0 2px">${c[0]} · ${c[1]}</h3><p class="small muted">${c[2]} &middot; ${esc(CLASS_TEACHERS[c[0] + '|' + c[1]] || '')}</p><div class="divider"></div><div class="row between"><span class="small muted">${n} students</span><button class="link-btn" data-act="class-list" data-cls="${c[0]}" data-sec="${c[1]}">View class ${ic('arrow', 'sm')}</button></div></div>`; }).join('')}</div>${sectionCard('Assigned Class Summary', 'Students across your teaching groups', `<div class="table-wrap"><table class="data"><thead><tr><th>Class</th><th>Section</th><th>Subject</th><th>Students</th><th>Boys</th><th>Girls</th><th></th></tr></thead><tbody>${rows.map(r => { const sub = STAFF_CLASSES.find(c => c[0] === r.cls && c[1] === r.sec); return `<tr><td><b>${esc(r.cls)}</b></td><td>${esc(r.sec)}</td><td>${esc(sub ? sub[2] : '—')}</td><td>${r.total}</td><td>${r.boys}</td><td>${r.girls}</td><td class="right"><button class="link-btn" data-act="class-list" data-cls="${r.cls}" data-sec="${r.sec}">View list</button></td></tr>`; }).join('')}</tbody></table></div>`)}`;
  } else {
    const teacherAllowed = ['principal'].includes(role);
    body = `<div class="grid g4">${kpi('Class Groups', rows.length, 'book', '', 'With active students')}${kpi('Total Strength', rows.reduce((n, r) => n + r.total, 0), 'users', 'blue', 'Current session')}${kpi('Largest Group', Math.max(...rows.map(r => r.total)), 'chart', 'green', 'Students')}${kpi('Avg. Class Size', Math.round(rows.reduce((n, r) => n + r.total, 0) / Math.max(1, rows.length)), 'trend', 'amber', 'Students per group')}</div>`
      + `<div class="grid g-2-1 mt"><div class="stack">${sectionCard('Class / Section Strength', 'Live counts from Student Master', `<div class="card-pad">${strengthBars(rows)}</div>`)}${sectionCard('Class & Section Directory', 'Strength, class teacher and roll-up', `<div class="table-wrap"><table class="data"><thead><tr><th>Class</th><th>Section</th><th>Class Teacher</th><th>Students</th><th>Boys</th><th>Girls</th><th>Active</th><th></th></tr></thead><tbody>${rows.map(r => `<tr><td><b>${esc(r.cls)}</b></td><td>${esc(r.sec)}</td><td>${esc(CLASS_TEACHERS[r.cls + '|' + r.sec] || 'Not assigned')}</td><td>${r.total}</td><td>${r.boys}</td><td>${r.girls}</td><td>${r.active}</td><td class="right"><button class="link-btn" data-act="class-list" data-cls="${r.cls}" data-sec="${r.sec}">View list</button></td></tr>`).join('')}</tbody></table></div>`, `<button class="link-btn" data-act="nav" data-view="reports">Full report</button>`)}</div><div class="stack">${sectionCard('Session Summary', 'Current academic session', `<div class="card-pad"><div class="profile-rows"><div><span>Session</span><b>${esc(activeSchoolSession().name)}</b></div><div><span>Class groups</span><b>${rows.length}</b></div><div><span>Class teachers</span><b>${rows.filter(r => CLASS_TEACHERS[r.cls + '|' + r.sec]).length}</b></div><div><span>Unassigned groups</span><b>${rows.filter(r => !CLASS_TEACHERS[r.cls + '|' + r.sec]).length}</b></div></div><p class="report-note mt-s">Class teachers are fictional demo assignments. Section grouping and sub-sections follow the shared masters.</p></div>`)}${sectionCard('Quick Actions', '', `<div class="card-pad">${quickActions([{ label: 'Students', sub: 'Master list', v: 'students', icon: 'users' }, { label: 'Verification', sub: 'Class sheets', v: 'verification', icon: 'checks' }, { label: 'Promotion', sub: 'Next session', v: 'promotion', icon: 'trend' }, { label: 'Reports', sub: 'Strength / UDISE', v: 'reports', icon: 'chart' }])}</div>`)}</div></div>`;
  }
  return pageHead(role === 'class_teacher' ? 'My Class' : role === 'teacher' ? 'My Classes' : 'Classes & Sections', 'Class and section strength generated from the shared Student Master.', actions) + body;
}

/* ============================= student list ============================= */
function studentsView() {
  const role = state.user.role;
  const f = state.stu;
  const rows = filteredStudents();
  const pages = Math.max(1, Math.ceil(rows.length / state.size));
  const page = Math.min(state.page, pages);
  state.page = page;
  const slice = rows.slice((page - 1) * state.size, page * state.size);
  const canEdit = role === 'admin';
  const actions = role === 'admin'
    ? `<button class="btn btn-outline" data-act="export-students">${ic('download', 'sm')} Export CSV</button><button class="btn btn-primary" data-act="nav" data-view="student-form">${ic('plus', 'sm')} Add Student</button>`
    : role === 'office' ? `<button class="btn btn-outline" data-act="export-students">${ic('download', 'sm')} Export CSV</button><button class="btn btn-primary" data-act="nav" data-view="admissions">Admissions</button>`
    : `<button class="btn btn-outline" data-act="export-students">${ic('download', 'sm')} Export CSV</button>${role === 'principal' ? `<button class="btn btn-primary" data-act="nav" data-view="reports">Reports</button>` : ''}`;
  const idLabel = DB.school.idLabel || 'Admission No.';
  return pageHead(role === 'teacher' ? 'My Students' : role === 'class_teacher' ? 'Class Student List' : role === 'office' ? 'Student Records' : role === 'admin' ? 'Student Master' : 'Student Directory', 'Search, filter and review student records. Archived students are only visible to the School Admin.', actions)
    + `<div class="notice"><span class="mark">i</span><div><b>Frontend demonstration.</b> ${role === 'admin' ? 'Add, edit and archive actions are simulated in browser memory. ' : 'This view is read-only for your role. '}Student identifiers use the school-configured label <b>${esc(idLabel)}</b>.</div></div>`
    + `<div class="card table-card">
      <form class="filters" data-form="stu-filter">
        <div class="field search"><label for="stuQ">Search</label><span>${ic('search', 'sm')}</span><input id="stuQ" name="q" value="${esc(f.q)}" placeholder="Name, ID, mobile, father or PEN" /></div>
        <div class="field"><label>Class</label><select name="cls">${opts(DB.masters.classes, f.cls, 'All classes')}</select></div>
        <div class="field"><label>Section</label><select name="sec">${opts(DB.masters.sections, f.sec, 'All')}</select></div>
        <div class="field"><label>Status</label><select name="status">${opts(DB.masters.studentStatuses, f.status, 'All statuses')}</select></div>
        ${role === 'admin' ? `<div class="field"><label>Records</label><select name="arch"><option value="0"${f.arch === '0' ? ' selected' : ''}>Active only</option><option value="1"${f.arch === '1' ? ' selected' : ''}>Include archived</option></select></div>` : ''}
        <button class="btn btn-primary btn-sm" type="submit">${ic('search', 'sm')} Apply</button>
        <button class="btn btn-ghost btn-sm" type="button" data-act="reset-stu">Reset</button>
      </form>
      <div class="table-wrap"><table class="data"><thead><tr><th><input class="checkbox" type="checkbox" aria-label="Select all" disabled title="Bulk actions are not enabled in this demo"></th><th>Student</th><th>${esc(idLabel)}</th><th>Class / Section</th><th>Father</th><th>Mobile</th><th>Status</th><th>Admission</th><th></th></tr></thead><tbody>
      ${slice.map(s => `<tr><td><input class="checkbox" type="checkbox" aria-label="Select ${esc(s.name)}" disabled></td><td>${studentLink(s)}${s.archived ? ' ' + pill('Archived', 'grey') : ''}</td><td>${esc(s.admNo)}</td><td><b>${esc(s.className)}</b> <span class="muted">/ ${esc(s.section)}</span></td><td>${esc(s.fatherName)}</td><td>${esc(s.mobile)}</td><td>${statusPill(s.studentStatus)}</td><td>${statusPill(s.admissionStatus)}</td><td class="right row-actions"><button class="btn-icon icon-btn" title="View" data-act="view-student" data-id="${s.id}">${ic('arrow', 'sm')}</button>${canEdit ? `<button class="btn-icon icon-btn" title="Edit" data-act="edit-student" data-id="${s.id}">${ic('edit', 'sm')}</button><button class="btn-icon icon-btn" title="${s.archived ? 'Restore' : 'Archive'}" data-act="${s.archived ? 'restore-student' : 'archive-student'}" data-id="${s.id}">${ic(s.archived ? 'check' : 'archive', 'sm')}</button>` : ''}</td></tr>`).join('') || `<tr><td colspan="9">${emptyBox('No students match these filters', 'Adjust the search or filters and try again.')}</td></tr>`}
      </tbody></table></div>
      ${pager(rows.length)}
    </div>`
    + `<div class="grid g2 mt">${sectionCard('Records Summary', 'Current filter result', `<div class="card-pad"><div class="kv">${kv('Matching records', rows.length + ' students')}${kv('Active', rows.filter(s => s.studentStatus === 'Active').length)}${kv('TC Taken', rows.filter(s => s.studentStatus === 'TC Taken').length)}${kv('Drop Out', rows.filter(s => s.studentStatus === 'Drop Out').length)}${kv('Archived', rows.filter(s => s.archived).length)}${kv('Boys / Girls', rows.filter(s => s.gender === 'Male').length + ' / ' + rows.filter(s => s.gender === 'Female').length)}</div></div>`)}${sectionCard('Need a report?', 'Dynamic columns and exports', `<div class="card-pad"><p class="report-note">Build a custom student report with dynamic output columns, export CSV or print the current view.</p><div class="row"><button class="btn btn-soft btn-sm" data-act="nav" data-view="reports">${ic('chart', 'sm')} Report builder</button><button class="btn btn-outline btn-sm" data-act="print-current">${ic('print', 'sm')} Print current table</button></div></div>`)}</div>`;
}

/* ============================= student detail ============================= */
function studentDetailView(params) {
  const role = state.user.role;
  let id = params.id || (role === 'parent' || role === 'student' ? 'st1' : '');
  if (role === 'parent' || role === 'student') id = 'st1';
  const s = byId(id);
  if (!s) return pageHead('Student Profile', 'Student record not found.') + `<div class="card">${emptyBox('Student not found', 'The requested demo record does not exist.')}</div>`;
  if ((role === 'teacher' || role === 'class_teacher') && !visibleStudents(true).some(x => x.id === s.id)) return pageHead('Student Profile', 'Record outside your assigned classes.') + `<div class="card">${emptyBox('Not available', 'This student is not in your assigned class or teaching group.')}</div>`;
  const canEdit = role === 'admin';
  const canArchive = role === 'admin';
  const canVerify = ['admin', 'class_teacher', 'principal'].includes(role);
  const docs = DB.docs.filter(d => d.studentId === s.id && !d.archived);
  const actions = `<div class="detail-actions">${canVerify ? `<button class="btn btn-outline btn-sm" data-act="nav" data-view="verification">${ic('checks', 'sm')} Verification</button>` : ''}${role === 'parent' ? `<button class="btn btn-outline btn-sm" data-act="nav" data-view="documents">${ic('folder', 'sm')} Documents</button>` : ''}<button class="btn btn-outline btn-sm" data-act="print">${ic('print', 'sm')} Print</button>${canEdit ? `<button class="btn btn-primary btn-sm" data-act="edit-student" data-id="${s.id}">${ic('edit', 'sm')} Edit</button>${canArchive ? `<button class="btn btn-outline btn-sm" data-act="${s.archived ? 'restore-student' : 'archive-student'}" data-id="${s.id}">${ic(s.archived ? 'check' : 'archive', 'sm')} ${s.archived ? 'Restore' : 'Archive'}</button>` : ''}` : ''}</div>`;
  const personal = `<div class="kv">${kv('Full Name', s.name)}${kv('Gender', s.gender)}${kv('Date of Birth', fmtDate(s.dob))}${kv('Blood Group', s.bloodGroup)}${kv('Nationality', s.nationality)}${kv('Religion', s.religion)}${kv('Social Category', s.socialCategory)}${kv('Mother Tongue', s.motherTongue)}${kv('House', s.house)}${kv('Sibling', s.siblings === 'Yes' ? s.siblingDetails : 'No')}${kv('Height / Weight', `${s.height || '—'} cm / ${s.weight || '—'} kg`)}${kv('Student Status', s.studentStatus)}</div>`;
  const contact = `<div class="kv">${kv('Mobile', s.mobile)}${kv('Email', s.email)}${kv('Address', s.address)}${kv('District', s.district)}${kv('State', s.state)}${kv('PIN Code', s.pincode)}${kv('Transport', s.transport)}${kv('RTE', s.rte)}${kv('Disability', s.disability)}</div>`;
  const father = `<div class="kv">${kv('Name', s.fatherName)}${kv('Occupation', s.fatherOccupation)}${kv('Department / Business', s.fatherDepartment)}${kv('Designation', s.fatherDesignation)}${kv('Organisation', s.fatherOrg)}${kv('Employee No.', s.fatherEmployee)}${kv('Mobile', s.fatherMobile)}${kv('Email', s.fatherEmail)}${kv('Office Phone', s.fatherOfficePhone)}${kv('Annual Income', s.fatherIncome ? '₹ ' + Number(s.fatherIncome).toLocaleString('en-IN') : '')}${kv('Date of Birth', fmtDate(s.fatherDob))}${kv('Organisation Address', s.fatherOrgAddress)}</div>`;
  const mother = `<div class="kv">${kv('Name', s.motherName)}${kv('Occupation', s.motherOccupation)}${kv('Department / Business', s.motherDepartment)}${kv('Designation', s.motherDesignation)}${kv('Organisation', s.motherOrg)}${kv('Employee No.', s.motherEmployee)}${kv('Mobile', s.motherMobile)}${kv('Email', s.motherEmail)}${kv('Office Phone', s.motherOfficePhone)}${kv('Annual Income', s.motherIncome ? '₹ ' + Number(s.motherIncome).toLocaleString('en-IN') : '')}${kv('Date of Birth', fmtDate(s.motherDob))}${kv('Organisation Address', s.motherOrgAddress)}</div>`;
  const guardian = s.guardianName ? `<div class="kv">${kv('Name', s.guardianName)}${kv('Relation', s.guardianRelation)}${kv('Contact', s.guardianContact)}${kv('Address', s.guardianAddress)}</div>` : `<p class="report-note">No local guardian recorded for this student.</p>`;
  const prev = s.prevSchoolName ? `<div class="kv">${kv('Previous School', s.prevSchoolName)}${kv('Address', s.prevSchoolAddress)}${kv('Board', s.prevSchoolBoard)}${kv('Last Exam %', s.prevSchoolPercentage ? s.prevSchoolPercentage + '%' : '')}${kv('TC Number', s.prevTcNo)}</div>` : `<p class="report-note">No previous school recorded.</p>`;
  const udise = `<div class="kv">${kv('PEN No.', s.penNo)}${kv('APAAR ID', s.apaarId)}${kv('Form No.', s.formNo)}${kv('Country', s.country)}${kv('Caste', s.caste)}${kv('Minority', s.minority)}${kv('BPL', s.bpl)}${kv('RTE', s.rte)}${kv('Disability', s.disability)}${kv('Transport', s.transport)}${kv('Admission Status', s.admissionStatus)}${kv('Remarks', s.remarks || '—')}</div>`;
  const enroll = `<div class="table-wrap"><table class="data"><thead><tr><th>Session</th><th>Class</th><th>Section</th><th>Roll No.</th><th>Result</th></tr></thead><tbody>${(s.enrollments || []).slice().reverse().map(e => `<tr><td><b>${esc(e.session)}</b>${e.session === activeSchoolSession().name ? ' ' + pill('Current', 'green') : ''}</td><td>${esc(e.class)}</td><td>${esc(e.section)}</td><td>${esc(e.roll)}</td><td>${pill(e.result || 'Studying', e.result === 'Promoted' ? 'blue' : 'green')}</td></tr>`).join('')}</tbody></table></div><p class="report-note mt-s">Year-wise class details are preserved when a student is promoted. History is never deleted by the demo promotion action.</p>`;
  const history = s.history.length ? `<div class="timeline">${s.history.map(h => `<div class="tl-item on"><b>${esc(h.changes)}</b><small>${esc(h.date)} &middot; ${esc(h.by)}</small><p>Prior values retained in the demo history snapshot.</p></div>`).join('')}</div>` : `<p class="report-note">No edits recorded for this student yet. Editing personal details preserves a before-change snapshot here.</p>`;
  const docList = `<div class="list">${docs.map(d => `<div class="list-item"><span class="doc-type">${esc((d.type || 'DOC').slice(0, 3))}</span><div><b>${esc(d.name)}</b><small>${esc(d.type)} &middot; ${esc(d.date)} &middot; ${esc(d.size)}</small></div><div class="r"><button class="link-btn" data-act="doc-dl" data-id="${d.id}">Download</button></div></div>`).join('') || `<p class="report-note">No admission documents linked. The School Office and Admin can add these in the Document Repository.</p>`}</div>`;
  return printHead('Student Profile · ' + s.name)
    + pageHead('Student Profile', `${s.regNo} · detailed view of personal, academic, family and UDISE information.`, '')
    + `<div class="card card-pad mb0"><div class="detail-top">${avatar(s)}<div><h1>${esc(s.name)}</h1><div class="meta">${esc(s.className)} ${esc(s.section)} &middot; Roll ${esc(s.rollNo)} &middot; ${esc(s.regNo)}</div><div class="row mt-s">${statusPill(s.studentStatus)}${statusPill(s.admissionStatus)}${s.archived ? pill('Archived record', 'grey') : ''}<span class="chip">${esc(DB.school.idLabel)}: ${esc(s.admNo)}</span></div></div>${actions}</div></div>`
    + `<div class="grid g-1-2 mt"><div class="stack sticky-aside"><div class="card profile-card"><div class="profile-cover"></div><div class="profile-main">${avatar(s)}<h2>${esc(s.name)}</h2><p>${esc(s.regNo)}</p>${statusPill(s.studentStatus)}</div><div class="profile-meta"><div><span>Class</span><b>${esc(s.className)} ${esc(s.section)}</b></div><div><span>Roll</span><b>${esc(s.rollNo)}</b></div><div><span>Session</span><b>${esc(activeSchoolSession().name)}</b></div><div><span>House</span><b>${esc(s.house)}</b></div></div><div class="profile-rows"><div><span>${esc(DB.school.idLabel)}</span><b>${esc(s.admNo)}</b></div><div><span>Mobile</span><b>${esc(s.mobile)}</b></div><div><span>Father</span><b>${esc(s.fatherName)}</b></div><div><span>Mother</span><b>${esc(s.motherName)}</b></div><div><span>Blood group</span><b>${esc(s.bloodGroup)}</b></div><div><span>Documents</span><b>${docs.length} linked</b></div></div><div class="card-pad" style="padding-top:0"><button class="btn btn-soft btn-sm btn-block" data-act="view-docs" data-id="${s.id}">${ic('folder', 'sm')} View documents</button></div></div><div class="notice"><span class="mark">i</span><div>Confidential student information. Demo data is fictional; no record leaves this browser.</div></div></div>
    <div class="stack">${acc('Personal & Academic Details', 'Identity, admission, class and status', personal, true, 'id')}${acc('Contact & Address', 'Student communication details', contact, false, 'phone')}${acc('Father Details', 'Occupation, organisation and contact', father, false, 'user')}${acc('Mother Details', 'Occupation, organisation and contact', mother, false, 'user')}${acc('Local Guardian', 'Alternative guardian contact', guardian, false, 'users')}${acc('Previous School', 'Previous school and last examination', prev, false, 'book')}${acc('UDISE & Other Parameters', 'Identifiers and UDISE-related fields', udise, false, 'file')}${acc('Academic History & Promotion', 'Year-wise class and promotion details', enroll, false, 'calendar')}${acc('Change History', 'Previous student details preserved on edit', history, false, 'clock')}${acc('Linked Documents', 'Admission documents in repository', docList, false, 'folder')}</div></div>`;
}

/* ============================= add / edit student ============================= */
function studentFormView(params) {
  const editing = params.id ? byId(params.id) : null;
  if (params.id && !editing) return pageHead('Edit Student', 'Student not found.') + `<div class="card">${emptyBox('Student not found')}</div>`;
  const blank = {
    name: '', gender: '', dob: '', admissionDate: todayStr(), className: '', section: '', subSection: '', rollNo: '', studentStatus: 'Active', admissionStatus: 'Form Filled', house: '',
    siblings: 'No', siblingDetails: '', regNo: '', admNo: '', penNo: '', apaarId: '', formNo: '', mobile: '', email: '', state: 'Uttar Pradesh', district: '', pincode: '', address: '', transport: 'Private',
    socialCategory: '', caste: '', religion: '', motherTongue: '', bloodGroup: '', nationality: 'Indian', country: 'India', weight: '', height: '', disability: 'No', minority: 'No', bpl: 'No', rte: 'No', remarks: '',
    fatherName: '', fatherOccupation: '', fatherDepartment: '', fatherDesignation: '', fatherOrg: '', fatherEmployee: '', fatherOrgAddress: '', fatherEmail: '', fatherIncome: '', fatherOfficePhone: '', fatherDob: '', fatherMobile: '',
    motherName: '', motherOccupation: '', motherDepartment: '', motherDesignation: '', motherOrg: '', motherEmployee: '', motherOrgAddress: '', motherEmail: '', motherIncome: '', motherOfficePhone: '', motherDob: '', motherMobile: '',
    guardianName: '', guardianRelation: '', guardianContact: '', guardianAddress: '',
    prevSchoolName: '', prevSchoolAddress: '', prevSchoolBoard: '', prevSchoolPercentage: '', prevTcNo: ''
  };
  const s = editing || blank;
  const val = k => esc(s[k] ?? '');
  const input = (k, label, type = 'text', extra = '') => `<div class="field"><label for="s_${k}">${esc(label)}</label><input id="s_${k}" data-k="${k}" type="${type}" value="${val(k)}" ${extra}></div>`;
  const select = (k, label, arr, ph = 'Select') => `<div class="field"><label for="s_${k}">${esc(label)}</label><select id="s_${k}" data-k="${k}">${opts(arr, s[k] || '', ph)}</select></div>`;
  const area = (k, label, wide = false, ph = '') => `<div class="field${wide ? ' field-wide' : ''}"><label for="s_${k}">${esc(label)}</label><textarea id="s_${k}" data-k="${k}" placeholder="${esc(ph)}">${esc(s[k] || '')}</textarea></div>`;
  const photo = state.formPhoto;
  const photoBlock = `<div class="photo-upload"><span class="avatar" id="formAvatar">${photo ? `<img src="${photo}" alt="Photo preview">` : esc(initials(s.name || 'New Student'))}</span><div class="pinfo"><b>Student photograph</b><small>JPG or PNG up to 2 MB. Preview only; the file stays in this browser.</small></div><label class="btn btn-outline btn-sm upload-btn">${ic('upload', 'sm')} Choose photo<input type="file" id="photoFile" accept="image/*" hidden></label>${photo ? '<button type="button" class="btn btn-ghost btn-sm" data-act="clear-photo">Remove</button>' : ''}</div>`;
  const personal = `<div class="fields">
    ${input('name', 'Full Name *', 'text', 'placeholder="Student name as per records"')}
    ${select('gender', 'Gender *', ['Male', 'Female', 'Other'])}
    ${input('dob', 'Date of Birth *', 'date')}
    ${input('admissionDate', 'Admission Date *', 'date')}
    ${select('className', 'Class *', DB.masters.classes)}
    ${select('section', 'Section *', DB.masters.sections)}
    ${select('subSection', 'Sub-section', DB.masters.subSections, 'Not applicable')}
    ${input('rollNo', 'Roll No.', 'text', 'placeholder="Auto if blank"')}
    ${select('studentStatus', 'Student Status', DB.masters.studentStatuses)}
    ${select('admissionStatus', 'Admission Status', DB.masters.admissionStatuses)}
    ${select('house', 'House', DB.masters.houses)}
    ${select('siblings', 'Any Siblings?', ['No', 'Yes'])}
    ${input('siblingDetails', 'Sibling Details', 'text', 'placeholder="Name / class / ID"')}
    ${input('regNo', DB.school.idLabel + ' / Reg No.', 'text', 'placeholder="Auto-generated if blank"')}
    ${input('admNo', 'Admission No.', 'text', 'placeholder="Auto-generated if blank"')}
    ${input('penNo', 'PEN No.')}
    ${input('apaarId', 'APAAR ID')}
    ${input('formNo', 'Form No.')}
  </div>`;
  const contact = `<div class="fields">${input('mobile', 'Mobile No. *', 'tel', 'maxlength="10" inputmode="numeric" placeholder="10-digit mobile"')}${input('email', 'Email', 'email')}${select('state', 'State', DB.masters.states)}${input('district', 'District')}${input('pincode', 'PIN Code', 'text', 'maxlength="6" inputmode="numeric"')}${select('transport', 'Transport', ['School Bus', 'Private', 'Walking', 'Public Transport'])}${area('address', 'Address *', true, 'House / street / locality')}</div>`;
  const other = `<div class="fields">${select('socialCategory', 'Social Category', DB.masters.socialCategories)}${select('caste', 'Caste', DB.masters.castes)}${select('religion', 'Religion', DB.masters.religions)}${select('motherTongue', 'Mother Tongue', DB.masters.languages)}${select('bloodGroup', 'Blood Group', DB.masters.bloodGroups)}${select('nationality', 'Nationality', DB.masters.nationalities)}${select('country', 'Country', DB.masters.countries)}${input('weight', 'Weight (kg)', 'number', 'min="0" step="0.1"')}${input('height', 'Height (cm)', 'number', 'min="0" step="0.1"')}${select('disability', 'Disability', ['No', 'Yes'])}${select('minority', 'Minority', ['No', 'Yes'])}${select('bpl', 'BPL', ['No', 'Yes'])}${select('rte', 'RTE', ['No', 'Yes'])}${area('remarks', 'Remarks', true)}</div>`;
  const father = `<div class="fields">${input('fatherName', "Father's Name")}${select('fatherOccupation', 'Occupation', DB.masters.occupations)}${input('fatherDepartment', 'Department / Business')}${input('fatherDesignation', 'Designation', 'text', 'list="designationList"')}${input('fatherOrg', 'Organisation Name')}${input('fatherEmployee', 'Employee No.')}${input('fatherMobile', 'Mobile No.')}${input('fatherEmail', 'Email', 'email')}${input('fatherOfficePhone', 'Office Phone')}${input('fatherIncome', 'Annual Income', 'number', 'min="0"')}${input('fatherDob', 'Date of Birth', 'date')}${input('fatherOrgAddress', 'Organisation Address')}</div>`;
  const mother = `<div class="fields">${input('motherName', "Mother's Name")}${select('motherOccupation', 'Occupation', DB.masters.occupations)}${input('motherDepartment', 'Department / Business')}${input('motherDesignation', 'Designation')}${input('motherOrg', 'Organisation Name')}${input('motherEmployee', 'Employee No.')}${input('motherMobile', 'Mobile No.')}${input('motherEmail', 'Email', 'email')}${input('motherOfficePhone', 'Office Phone')}${input('motherIncome', 'Annual Income', 'number', 'min="0"')}${input('motherDob', 'Date of Birth', 'date')}${input('motherOrgAddress', 'Organisation Address')}</div>`;
  const guardian = `<div class="fields">${input('guardianName', 'Guardian Name')}${input('guardianRelation', 'Relation')}${input('guardianContact', 'Contact No.')}${area('guardianAddress', 'Address', true)}</div>`;
  const previous = `<div class="fields">${input('prevSchoolName', 'Previous School Name')}${input('prevSchoolAddress', 'School Address')}${select('prevSchoolBoard', 'Board', DB.masters.boards)}${input('prevSchoolPercentage', 'Last Exam Percentage', 'number', 'min="0" max="100" step="0.01"')}${input('prevTcNo', 'Transfer Certificate No.')}</div>`;
  return pageHead(editing ? 'Edit Student' : 'Add Student', editing ? `Update the student record for ${editing.name}. Previous values are preserved in change history.` : 'Create a new Student Master record. Fields marked * are validated in this prototype.', `<button class="btn btn-outline" data-act="back-students">Cancel</button><button class="btn btn-primary" type="submit" form="studentForm">${ic('check', 'sm')} ${editing ? 'Save Changes' : 'Add Student'}</button>`)
    + printHead('Student Admission Form')
    + `<form id="studentForm" data-id="${editing ? editing.id : ''}" novalidate>
      <div class="card form-card">
        <div class="section-title"><div><h2>${esc(DB.school.idLabel)} details</h2><p>Photo preview and core identity information</p></div>${pill('Session ' + activeSchoolSession().name, 'violet')}</div>
        ${photoBlock}
        <div class="form-error" id="formError" role="alert"></div>
      </div>
      ${acc('Personal & Academic Details', 'Identity, class assignment, status and identifiers', personal, true, 'id')}
      ${acc('Contact & Address', 'Student communication details', contact, true, 'phone')}
      ${acc('Father Details', 'Occupation, organisation and contact', father, false, 'user')}
      ${acc('Mother Details', 'Occupation, organisation and contact', mother, false, 'user')}
      ${acc('Local Guardian', 'Alternative guardian contact', guardian, false, 'users')}
      ${acc('Previous School', 'Previous school and last examination', previous, false, 'book')}
      ${acc('Other / UDISE Parameters', 'Social, health and UDISE-related fields', other, false, 'file')}
      <div class="card form-card form-actions" style="justify-content:space-between"><div><b class="small">${editing ? 'Editing an existing record' : 'New student record'}</b><div class="hint">Demo only. No information is sent to a server.</div></div><div class="row"><button class="btn btn-outline" type="button" data-act="back-students">Cancel</button><button class="btn btn-primary" type="submit">${ic('check', 'sm')} ${editing ? 'Save Changes' : 'Add Student'}</button></div></div>
    </form>`;
}

/* ============================= masters ============================= */
function mastersView() {
  const key = state.masterKey;
  const def = MASTER_DEFS.find(m => m.key === key) || MASTER_DEFS[0];
  const items = DB.masters[key] || [];
  const q = state.masterQ.trim().toLowerCase();
  const shown = q ? items.filter(i => i.toLowerCase().includes(q)) : items;
  const usage = item => {
    const map = { classes: 'className', houses: 'house', bloodGroups: 'bloodGroup', socialCategories: 'socialCategory', languages: 'motherTongue', boards: 'prevSchoolBoard', studentStatuses: 'studentStatus', admissionStatuses: 'admissionStatus', states: 'state', countries: 'country', nationalities: 'nationality', religions: 'religion', castes: 'caste', sections: 'section', subSections: 'subSection', occupations: 'fatherOccupation', departments: 'fatherDepartment', designations: 'fatherDesignation' };
    const field = map[key];
    return field ? DB.students.filter(s => s[field] === item).length : 0;
  };
  const navList = MASTER_DEFS.map(m => `<button class="${m.key === key ? 'on' : ''}" data-act="master-pick" data-k="${m.key}">${esc(m.label)}<span class="n">${DB.masters[m.key].length}</span></button>`).join('');
  return pageHead('School Masters', 'Shared master data powers dropdowns across student forms, filters and reports.', `<button class="btn btn-outline" data-act="nav" data-view="sessions">${ic('calendar', 'sm')} Academic Sessions</button><button class="btn btn-primary" data-act="nav" data-view="students">Student Master</button>`)
    + `<div class="notice"><span class="mark">i</span><div><b>${esc(def.label)} master.</b> Changes update the shared in-memory dataset and therefore every form, filter and report in this demo. Document master items are used in the admission document repository.</div></div>`
    + `<div class="master-layout"><div class="card master-nav">${navList}<button data-act="nav" data-view="sessions">Academic Sessions<span class="n">${DB.sessions.length}</span></button></div>
      <div class="stack">${sectionCard(def.label + ' Master', `${items.length} configured values`, `<form class="inline-form" data-form="master-add"><input class="input" name="value" placeholder="Add a new ${esc(def.label.toLowerCase())} value" required maxlength="60"><button class="btn btn-primary btn-sm" type="submit">${ic('plus', 'sm')} Add Value</button><input class="input" style="max-width:180px" id="masterSearch" placeholder="Filter values" value="${esc(state.masterQ)}"><button class="btn btn-ghost btn-sm" type="button" data-act="master-search">Filter</button></form><div class="table-wrap"><table class="data"><thead><tr><th>Value</th><th>Used by</th><th>Type</th><th></th></tr></thead><tbody>${shown.map(item => `<tr><td><b>${esc(item)}</b></td><td>${usage(item)} record(s)</td><td>${pill('Shared master', 'violet')}</td><td class="right"><button class="link-btn danger" data-act="del-master" data-k="${key}" data-item="${esc(item)}">Remove</button></td></tr>`).join('') || `<tr><td colspan="4">${emptyBox('No matching values')}</td></tr>`}</tbody></table></div>`, `<span class="chip">${esc(def.label)}</span>`)}
      <div class="grid g2">${sectionCard('Master Usage', 'Why masters matter', `<div class="card-pad"><p class="report-note">Student forms, directory filters and reports all read from this shared master data. Remove a value only after confirming no active student record depends on it.</p><div class="row">${['Class', 'Section', 'House', 'Blood Group', 'Social Category', 'Admission Status'].map(x => `<span class="chip on">${esc(x)}</span>`).join('')}</div></div>`)}${sectionCard('Admission Documents', 'Session-wise document requirements', `<div class="card-pad"><div class="list">${DB.masters.documentTypes.map(d => `<div class="list-item"><span class="doc-type">DOC</span><div><b>${esc(d)}</b><small>Required for new admissions (demo)</small></div><div class="r">${pill('Configured', 'green')}</div></div>`).join('')}</div></div>`)}</div></div></div>`;
}

/* ============================= academic sessions ============================= */
function sessionsView() {
  const cur = activeSchoolSession();
  return pageHead('Academic Sessions', 'Create sessions, set the current session and preserve year-wise student history.', `<button class="btn btn-outline" data-act="nav" data-view="promotion">${ic('trend', 'sm')} Student Promotion</button><button class="btn btn-primary" data-act="nav" data-view="classes">Classes & Sections</button>`)
    + `<div class="grid g4">${kpi('Current Session', cur.name, 'calendar', '', 'Active school year')}${kpi('Configured Sessions', DB.sessions.length, 'layers', 'blue', 'Including upcoming')}${kpi('Promotions Recorded', DB.audit.filter(a => a.module === 'Student Promotion').length, 'trend', 'green', 'Demo actions')}${kpi('Enrollment Rows', DB.students.reduce((n, s) => n + (s.enrollments || []).length, 0), 'users', 'amber', 'History preserved')}</div>`
    + `<div class="grid g-2-1 mt"><div class="stack">${sectionCard('Academic Sessions', 'Session lifecycle and current status', `<div class="table-wrap"><table class="data"><thead><tr><th>Session</th><th>Start</th><th>End</th><th>Status</th><th>Students</th><th></th></tr></thead><tbody>${DB.sessions.map(s => `<tr><td><b>${esc(s.name)}</b></td><td>${esc(fmtDate(s.start))}</td><td>${esc(fmtDate(s.end))}</td><td>${s.current ? pill('Current', 'green') : new Date(s.start) > new Date() ? pill('Upcoming', 'blue') : pill('Closed', 'grey')}</td><td>${DB.students.filter(x => (x.enrollments || []).some(e => e.session === s.name)).length}</td><td class="right">${s.current ? '<span class="tiny muted">Active</span>' : `<button class="link-btn" data-act="session-set" data-id="${s.id}">Set current</button>`}</td></tr>`).join('')}</tbody></table></div>`, `<span class="chip">${esc(cur.name)}</span>`)}${sectionCard('Promotion History', 'Demo audit entries for student promotion', `<div class="table-wrap"><table class="data"><thead><tr><th>Date</th><th>By</th><th>Detail</th></tr></thead><tbody>${DB.audit.filter(a => a.module === 'Student Promotion').slice(0, 8).map(a => `<tr><td>${esc(a.date)}</td><td>${esc(a.user)}</td><td>${esc(a.detail)}</td></tr>`).join('') || `<tr><td colspan="3">${emptyBox('No promotions yet', 'Use Student Promotion to simulate promoting a class.')}</td></tr>`}</tbody></table></div>`)}</div>
    <div class="stack">${sectionCard('Add Session', 'Next academic year', `<form class="card-pad" data-form="session-add"><div class="field"><label for="sesName">Session name</label><input id="sesName" name="name" placeholder="e.g. 2028-29" required></div><div class="grid g2 mt-s"><div class="field"><label for="sesStart">Start date</label><input id="sesStart" name="start" type="date" required></div><div class="field"><label for="sesEnd">End date</label><input id="sesEnd" name="end" type="date" required></div></div><div class="form-error" id="sesError"></div><button class="btn btn-primary btn-block mt-s" type="submit">${ic('plus', 'sm')} Create session</button><p class="hint mt-s">New sessions start as upcoming. Set a session as current only after the academic year closes.</p></form>`)}${sectionCard('Preservation Rules', 'Demo behaviour', `<div class="card-pad"><div class="list"><div class="list-item"><span class="stat-icon blue">${ic('shield', 'sm')}</span><div><b>History retained</b><small>Promotion adds a new enrollment row; old rows remain.</small></div></div><div class="list-item"><span class="stat-icon amber">${ic('clock', 'sm')}</span><div><b>Audited actions</b><small>Promotions and session changes are logged.</small></div></div><div class="list-item"><span class="stat-icon green">${ic('check', 'sm')}</span><div><b>Current session</b><small>One session is marked current for the demo.</small></div></div></div></div>`)}</div></div>`;
}

/* ============================= promotion ============================= */
function promotionView() {
  const src = state.promoSrc, sec = state.promoSection;
  const list = mainStudents().filter(s => s.className === src && s.section === sec);
  const targets = DB.sessions.filter(s => !s.current).map(s => s.name);
  return pageHead('Student Promotion', 'Simulate promoting a class to the next academic session while preserving year-wise history.', `<button class="btn btn-outline" data-act="nav" data-view="sessions">${ic('calendar', 'sm')} Sessions</button><button class="btn btn-primary" data-act="nav" data-view="students">Student Master</button>`)
    + `<div class="notice warn"><span class="mark">i</span><div><b>Simulation.</b> Promotion changes the in-memory demo record. The existing enrollment row is marked <b>Promoted</b> and a new session row is added, so history is preserved. No real rollover occurs.</div></div>`
    + `<div class="grid g-3-1"><div class="stack"><div class="card"><form class="filters" data-form="promo-filter"><div class="field"><label>Source class</label><select name="src">${opts(DB.masters.classes, src)}</select></div><div class="field"><label>Section</label><select name="sec">${opts(DB.masters.sections, sec)}</select></div><div class="field"><label>Target session</label><select name="tsession">${opts(targets, state.promoTargetSession)}</select></div><button class="btn btn-primary btn-sm" type="submit">Load students</button></form></div>
      <form id="promoForm" data-form="promotion"><div class="card table-card"><div class="table-head"><div><h3>${esc(src)} ${esc(sec)} &middot; ${list.length} students</h3><p>Select students to promote to ${esc(state.promoTarget)} for ${esc(state.promoTargetSession)}</p></div><label class="row small muted"><input type="checkbox" class="checkbox" id="promoAll"> Select all</label></div><div class="table-wrap"><table class="data"><thead><tr><th></th><th>Roll</th><th>Student</th><th>Father</th><th>Student Status</th><th>Current Session</th></tr></thead><tbody>${list.map(s => `<tr><td><input class="checkbox promo-check" type="checkbox" value="${s.id}" aria-label="Select ${esc(s.name)}"></td><td>${esc(s.rollNo)}</td><td>${studentLink(s)}</td><td>${esc(s.fatherName)}</td><td>${statusPill(s.studentStatus)}</td><td>${pill(activeSchoolSession().name, 'violet')}</td></tr>`).join('') || `<tr><td colspan="6">${emptyBox('No students in this class/section')}</td></tr>`}</tbody></table></div></div>
      <div class="card form-card mt"><div class="grid g3"><div class="field"><label>Target class</label><select id="promoTarget" name="target">${opts(DB.masters.classes, state.promoTarget)}</select></div><div class="field"><label>Target section</label><select name="targetSec">${opts(DB.masters.sections, sec)}</select></div><div class="field"><label>Target session</label><select name="targetSession">${opts(targets, state.promoTargetSession)}</select></div></div><div class="form-error" id="promoError"></div><div class="row between mt"><span class="small muted">Promotion preserves the previous enrollment and contact history.</span><button class="btn btn-primary" type="submit">${ic('trend', 'sm')} Promote selected students</button></div></div></form></div>
      <div class="stack">${sectionCard('Promotion Summary', 'Before you confirm', `<div class="card-pad"><div class="profile-rows"><div><span>Source</span><b>${esc(src)} ${esc(sec)}</b></div><div><span>Students loaded</span><b>${list.length}</b></div><div><span>Target class</span><b>${esc(state.promoTarget)}</b></div><div><span>Target session</span><b>${esc(state.promoTargetSession)}</b></div><div><span>History</span><b>Preserved</b></div></div><div class="notice mt-s" style="margin-bottom:0"><span class="mark">i</span><div>Archived and inactive records are excluded from promotion.</div></div></div>`)}${sectionCard('Recent Promotions', 'Audit log', `<div class="card-pad">${auditMini(4)}</div>`)}</div></div>`;
}

/* ============================= reports ============================= */
const REPORT_COLS = [
  { key: 'regNo', label: 'ID / Reg No.' }, { key: 'name', label: 'Student Name' }, { key: 'className', label: 'Class' }, { key: 'section', label: 'Section' },
  { key: 'rollNo', label: 'Roll No.' }, { key: 'gender', label: 'Gender' }, { key: 'dob', label: 'Date of Birth' }, { key: 'fatherName', label: 'Father' },
  { key: 'motherName', label: 'Mother' }, { key: 'mobile', label: 'Mobile' }, { key: 'socialCategory', label: 'Social Category' }, { key: 'bloodGroup', label: 'Blood Group' },
  { key: 'house', label: 'House' }, { key: 'admissionStatus', label: 'Admission Status' }, { key: 'studentStatus', label: 'Student Status' }, { key: 'address', label: 'Address' }
];
function reportRows() {
  let list = mainStudents();
  if (state.reportCls) list = list.filter(s => s.className === state.reportCls);
  if (state.reportSec) list = list.filter(s => s.section === state.reportSec);
  return list;
}
function reportsView() {
  const tab = state.reportTab;
  const role = state.user.role;
  const canPrint = true;
  const tabs = `<div class="tabs"><button class="tab ${tab === 'strength' ? 'on' : ''}" data-act="report-tab" data-tab="strength">Class / Section Strength</button><button class="tab ${tab === 'list' ? 'on' : ''}" data-act="report-tab" data-tab="list">Class / Section List</button><button class="tab ${tab === 'builder' ? 'on' : ''}" data-act="report-tab" data-tab="builder">Report Builder</button><button class="tab ${tab === 'udise' ? 'on' : ''}" data-act="report-tab" data-tab="udise">UDISE Report</button></div>`;
  let body = '';
  if (tab === 'strength') {
    const rows = classRows(mainStudents());
    body = `<div class="grid g4">${kpi('Class Groups', rows.length, 'book')}${kpi('Total Students', rows.reduce((n, r) => n + r.total, 0), 'users', 'blue')}${kpi('Boys', rows.reduce((n, r) => n + r.boys, 0), 'user', 'green')}${kpi('Girls', rows.reduce((n, r) => n + r.girls, 0), 'user', 'amber')}</div>`
      + `<div class="grid g-2-1 mt"><div class="stack">${sectionCard('Class / Section Strength Report', 'Current session', `<div class="table-wrap"><table class="data"><thead><tr><th>Class</th><th>Section</th><th>Class Teacher</th><th>Total</th><th>Boys</th><th>Girls</th><th>Active</th><th>TC / Drop</th></tr></thead><tbody>${rows.map(r => `<tr><td><b>${esc(r.cls)}</b></td><td>${esc(r.sec)}</td><td>${esc(CLASS_TEACHERS[r.cls + '|' + r.sec] || 'Not assigned')}</td><td><b>${r.total}</b></td><td>${r.boys}</td><td>${r.girls}</td><td>${r.active}</td><td>${r.total - r.active}</td></tr>`).join('')}<tr style="background:#fafbff"><td><b>Total</b></td><td></td><td></td><td><b>${rows.reduce((n, r) => n + r.total, 0)}</b></td><td><b>${rows.reduce((n, r) => n + r.boys, 0)}</b></td><td><b>${rows.reduce((n, r) => n + r.girls, 0)}</b></td><td><b>${rows.reduce((n, r) => n + r.active, 0)}</b></td><td><b>${rows.reduce((n, r) => n + r.total - r.active, 0)}</b></td></tr></tbody></table></div>`, `<button class="link-btn" data-act="export-report">Export CSV</button>`)}</div><div class="stack">${sectionCard('Strength Distribution', 'Visual overview', `<div class="card-pad">${strengthBars(rows)}</div>`)}${sectionCard('Report Notes', 'Demo output', `<div class="card-pad"><p class="report-note">Strength is derived from Student Master. TC Taken and Drop Out records remain counted in class totals for historical reporting.</p><button class="btn btn-outline btn-sm" data-act="print">${ic('print', 'sm')} Print report</button></div>`)}</div></div>`;
  } else if (tab === 'list') {
    const rows = reportRows();
    body = `<div class="card table-card"><form class="filters" data-form="report-filter"><div class="field"><label>Class</label><select name="cls">${opts(DB.masters.classes, state.reportCls, 'All classes')}</select></div><div class="field"><label>Section</label><select name="sec">${opts(DB.masters.sections, state.reportSec, 'All sections')}</select></div><button class="btn btn-primary btn-sm" type="submit">Apply</button><button class="btn btn-ghost btn-sm" type="button" data-act="reset-report">Clear</button><span class="small muted">${rows.length} students</span></form><div class="table-wrap"><table class="data"><thead><tr><th>Roll</th><th>Student</th><th>Class</th><th>Father</th><th>Mother</th><th>Mobile</th><th>Status</th><th></th></tr></thead><tbody>${rows.slice(0, 50).map(s => `<tr><td>${esc(s.rollNo)}</td><td>${studentLink(s)}</td><td>${esc(s.className)} ${esc(s.section)}</td><td>${esc(s.fatherName)}</td><td>${esc(s.motherName)}</td><td>${esc(s.mobile)}</td><td>${statusPill(s.studentStatus)}</td><td class="right"><button class="link-btn" data-act="view-student" data-id="${s.id}">View</button></td></tr>`).join('') || `<tr><td colspan="8">${emptyBox('No students for these filters')}</td></tr>`}</tbody></table></div><div class="pager"><small>Showing ${Math.min(50, rows.length)} of ${rows.length} students · export for the full list</small><div class="row"><button class="btn btn-outline btn-sm" data-act="export-report">${ic('download', 'sm')} Export CSV</button><button class="btn btn-outline btn-sm" data-act="print">${ic('print', 'sm')} Print</button></div></div></div>`;
  } else if (tab === 'builder') {
    const rows = reportRows();
    const cols = REPORT_COLS.filter(c => state.reportCols.includes(c.key));
    body = `<div class="grid g-3-1"><div class="stack">${sectionCard('Dynamic Student Report', `${rows.length} rows · choose columns`, `<div class="table-wrap"><table class="data"><thead><tr>${cols.map(c => `<th>${esc(c.label)}</th>`).join('')}</tr></thead><tbody>${rows.slice(0, 60).map(s => `<tr>${cols.map(c => `<td>${esc(s[c.key] || '—')}</td>`).join('')}</tr>`).join('') || `<tr><td colspan="${Math.max(1, cols.length)}">${emptyBox('Select at least one column')}</td></tr>`}</tbody></table></div><p class="report-note" style="padding:10px 16px 0">Showing first 60 rows. Export includes all students matching the class filter.</p>`)}</div><div class="stack">${sectionCard('Output Columns', 'Template-like column selection', `<div class="card-pad"><div class="chips">${REPORT_COLS.map(c => `<button class="chip ${state.reportCols.includes(c.key) ? 'on' : ''}" data-act="toggle-col" data-col="${c.key}">${esc(c.label)}</button>`).join('')}</div><div class="row mt"><button class="btn btn-soft btn-sm" data-act="all-cols">Select core columns</button><button class="btn btn-outline btn-sm" data-act="export-report">${ic('download', 'sm')} Export CSV</button></div></div>`)}${sectionCard('Filter', 'Apply to dynamic report', `<form class="card-pad" data-form="report-filter"><div class="field"><label>Class</label><select name="cls">${opts(DB.masters.classes, state.reportCls, 'All classes')}</select></div><div class="field mt-s"><label>Section</label><select name="sec">${opts(DB.masters.sections, state.reportSec, 'All sections')}</select></div><button class="btn btn-primary btn-sm btn-block mt-s" type="submit">Apply filters</button></form>`)}</div></div>`;
  } else {
    const rows = mainStudents();
    body = `<div class="notice"><span class="mark">i</span><div><b>UDISE-specific demo report.</b> Columns reflect common UDISE+ student parameters from the SOW. Field completeness and submission rules must be confirmed before production use.</div></div><div class="card table-card"><div class="table-head"><div><h3>UDISE Student Report</h3><p>${rows.length} student records · session ${esc(activeSchoolSession().name)}</p></div><div class="row"><button class="btn btn-outline btn-sm" data-act="export-udise">${ic('download', 'sm')} Export CSV</button><button class="btn btn-outline btn-sm" data-act="print">${ic('print', 'sm')} Print</button></div></div><div class="table-wrap"><table class="data"><thead><tr><th>Student</th><th>PEN</th><th>APAAR</th><th>Class</th><th>Gender</th><th>Category</th><th>Religion</th><th>Blood Group</th><th>RTE</th><th>Disability</th><th>Minority</th></tr></thead><tbody>${rows.slice(0, 60).map(s => `<tr><td><b>${esc(s.name)}</b><small class="muted">${esc(s.regNo)}</small></td><td>${esc(s.penNo)}</td><td>${esc(s.apaarId)}</td><td>${esc(s.className)} ${esc(s.section)}</td><td>${esc(s.gender)}</td><td>${esc(s.socialCategory)}</td><td>${esc(s.religion)}</td><td>${esc(s.bloodGroup)}</td><td>${esc(s.rte)}</td><td>${esc(s.disability)}</td><td>${esc(s.minority)}</td></tr>`).join('')}</tbody></table></div><p class="report-note" style="padding:10px 16px">Showing 60 of ${rows.length} records. CSV export includes all.</p></div>`;
  }
  return pageHead(role === 'manager' ? 'Summary Reports' : 'Reports & MIS', role === 'manager' ? 'Authorized summary reports. Manager report scope is provisional in this demo.' : 'Class strength, class lists, dynamic student reports and UDISE-specific output.', `<button class="btn btn-outline" data-act="export-report">${ic('download', 'sm')} Export CSV</button><button class="btn btn-primary" data-act="print">${ic('print', 'sm')} Print</button>`)
    + printHead('MIS Report · ' + (tab === 'udise' ? 'UDISE' : tab === 'strength' ? 'Class Strength' : 'Student Report'))
    + tabs + body;
}

/* ============================= verification sheet ============================= */
function verificationView() {
  const role = state.user.role;
  const isCT = role === 'class_teacher';
  const cls = isCT ? CT_CLASS[0] : state.verCls;
  const sec = isCT ? CT_CLASS[1] : state.verSec;
  const list = mainStudents().filter(s => s.className === cls && s.section === sec).sort((a, b) => Number(a.rollNo) - Number(b.rollNo));
  return pageHead('Verification Sheet', 'Share with students for correctness, collect signatures and confirm verification. Print output is optimised for paper.', `<button class="btn btn-outline" data-act="print">${ic('print', 'sm')} Print sheet</button><button class="btn btn-primary" data-act="verify-submit">${ic('checks', 'sm')} Mark verified</button>`)
    + `<div class="notice"><span class="mark">i</span><div><b>Class teacher workflow.</b> This sheet shows core personal, parent and contact fields for review. Demo verification is an audit-logged simulation and does not lock student records.</div></div>`
    + `<div class="card table-card"><form class="filters" data-form="ver-filter"><div class="field"><label>Class</label><select name="cls" ${isCT ? 'disabled' : ''}>${opts(DB.masters.classes, cls)}</select></div><div class="field"><label>Section</label><select name="sec" ${isCT ? 'disabled' : ''}>${opts(DB.masters.sections, sec)}</select></div>${isCT ? '' : '<button class="btn btn-primary btn-sm" type="submit">Load class</button>'}<span class="small muted">${list.length} students &middot; ${esc(activeSchoolSession().name)}</span></form>
      <div class="table-wrap"><table class="data"><thead><tr><th>#</th><th>${esc(DB.school.idLabel)}</th><th>Student Name</th><th>Date of Birth</th><th>Father's Name</th><th>Mother's Name</th><th>Mobile</th><th>Address</th><th>Student Signature</th></tr></thead><tbody>${list.map((s, i) => `<tr><td>${i + 1}</td><td>${esc(s.admNo)}</td><td><b>${esc(s.name)}</b></td><td>${esc(fmtDate(s.dob))}</td><td>${esc(s.fatherName)}</td><td>${esc(s.motherName)}</td><td>${esc(s.mobile)}</td><td class="small">${esc(s.address)}</td><td><span class="verif-sign"></span></td></tr>`).join('') || `<tr><td colspan="9">${emptyBox('No students in this class')}</td></tr>`}</tbody></table></div><div class="pager"><small>Verification sheet for ${esc(cls)} ${esc(sec)} · generated ${esc(nowStamp())}</small><span class="chip">Print &amp; sign</span></div></div>`
    + `<div class="grid g2 mt">${sectionCard('Verification Progress', 'Demo checklist', `<div class="card-pad"><div class="strength-row"><b>Students listed</b><div class="bar"><span style="width:100%"></span></div><span class="num">${list.length}</span></div><div class="strength-row"><b>Sheets printed</b><div class="bar amber"><span style="width:40%"></span></div><span class="num">—</span></div><div class="strength-row"><b>Signatures collected</b><div class="bar green"><span style="width:0%"></span></div><span class="num">0</span></div><div class="divider"></div><p class="report-note">Demo progress is illustrative. Use "Mark verified" to record an audit event.</p></div>`)}${sectionCard('Notes for Class Teachers', '', `<div class="card-pad"><div class="list"><div class="list-item"><span class="stat-icon blue">${ic('id', 'sm')}</span><div><b>Check identifiers</b><small>Verify ${esc(DB.school.idLabel)} and roll number.</small></div></div><div class="list-item"><span class="stat-icon amber">${ic('phone', 'sm')}</span><div><b>Confirm contact details</b><small>Parents should correct mobile and address.</small></div></div><div class="list-item"><span class="stat-icon green">${ic('checks', 'sm')}</span><div><b>Confirm after signatures</b><small>Mark the sheet verified when complete.</small></div></div></div></div>`)}</div>`;
}

/* ============================= photographs ============================= */
function photosView() {
  let list = mainStudents();
  if (state.photoCls) list = list.filter(s => s.className === state.photoCls);
  const uploaded = list.filter(s => s.photo).length;
  return pageHead('Student Photographs', 'Upload and review student photographs. Photo file naming follows the school ID (Student Reg No) in production.', `<button class="btn btn-outline" data-act="download-photos">${ic('download', 'sm')} Download all</button><button class="btn btn-primary" data-act="nav" data-view="students">Student Master</button>`)
    + `<div class="notice"><span class="mark">i</span><div><b>Demo photo upload.</b> Images are read locally with FileReader and shown in this browser only. No file is uploaded. Production naming: <b>StudentRegNo.jpg</b>.</div></div>`
    + `<div class="grid g4">${kpi('Students Listed', list.length, 'users')}${kpi('Photos Added', uploaded, 'image', 'green', 'Browser-only')}${kpi('Missing Photos', list.length - uploaded, 'file', 'amber', 'Upload to preview')}${kpi('Naming Rule', 'RegNo.jpg', 'settings', 'blue', 'Configured in SOW')}</div>`
    + `<div class="card table-card mt"><form class="filters" data-form="photo-filter"><div class="field"><label>Class</label><select name="cls">${opts(DB.masters.classes, state.photoCls, 'All classes')}</select></div><button class="btn btn-primary btn-sm" type="submit">Filter</button><button class="btn btn-ghost btn-sm" type="button" data-act="reset-photos">Clear</button><span class="small muted">Showing ${Math.min(60, list.length)} of ${list.length} students</span></form>
      <div class="card-pad"><div class="photo-grid">${list.slice(0, 60).map(s => `<div class="photo-tile">${avatar(s)}<b title="${esc(s.name)}">${esc(s.name)}</b><small>${esc(s.regNo)}</small><label class="btn btn-outline btn-sm upload-btn">${s.photo ? 'Change' : 'Upload'}<input type="file" accept="image/*" data-photo="${s.id}" hidden></label></div>`).join('') || emptyBox('No students found')}</div></div><div class="pager"><small>Photos are stored in memory and reset when the page is reloaded.</small><span class="chip">Class / School wise</span></div></div>`;
}

/* ============================= documents ============================= */
function visibleDocs() {
  let docs = DB.docs.filter(d => !d.archived);
  if (state.user.role === 'parent') docs = docs.filter(d => d.studentId === 'st1');
  return docs;
}
function documentsView() {
  const role = state.user.role;
  const docs = visibleDocs();
  let list = docs;
  if (state.docQ) list = filterList(list, state.docQ, ['name', 'studentId']);
  if (state.docType) list = list.filter(d => d.type === state.docType);
  const canAdd = ['admin', 'office'].includes(role);
  const canDelete = role === 'admin';
  return pageHead(role === 'parent' ? 'My Child\'s Documents' : 'Document Repository', 'Admission documents, certificates and student records held in the demo repository.', `<button class="btn btn-outline" data-act="nav" data-view="students">${ic('users', 'sm')} Students</button>${role === 'admin' ? `<button class="btn btn-primary" data-act="nav" data-view="photos">Photographs</button>` : ''}`)
    + `<div class="notice"><span class="mark">i</span><div><b>Access note.</b> ${role === 'parent' ? 'Parents see documents linked only to their child.' : 'Document access is simulated. The School Office has provisional access in this demo; production permissions must be defined by the SOW owner.'}</div></div>`
    + `<div class="grid g-3-1"><div class="stack"><div class="card table-card"><form class="filters" data-form="doc-filter"><div class="field search"><label>Search</label><span>${ic('search', 'sm')}</span><input name="q" value="${esc(state.docQ)}" placeholder="Document or student"></div><div class="field"><label>Type</label><select name="type">${opts(DB.masters.documentTypes, state.docType, 'All types')}</select></div><button class="btn btn-primary btn-sm" type="submit">Apply</button><button class="btn btn-ghost btn-sm" type="button" data-act="reset-docs">Reset</button></form><div class="table-wrap"><table class="data"><thead><tr><th>Document</th><th>Type</th><th>Linked Student</th><th>Date</th><th>Size</th><th>Added By</th><th></th></tr></thead><tbody>${list.map(d => { const st = byId(d.studentId); return `<tr><td><div class="row"><span class="doc-type">${esc((d.type || 'DOC').slice(0, 3))}</span><b>${esc(d.name)}</b></div></td><td>${esc(d.type)}</td><td>${st ? esc(st.name) + `<small class="muted"> · ${esc(st.regNo)}</small>` : '—'}</td><td>${esc(fmtDate(d.date))}</td><td>${esc(d.size)}</td><td>${esc(d.by)}</td><td class="right row-actions"><button class="btn-icon icon-btn" title="Download" data-act="doc-dl" data-id="${d.id}">${ic('download', 'sm')}</button>${canDelete ? `<button class="btn-icon icon-btn" title="Archive" data-act="doc-del" data-id="${d.id}">${ic('archive', 'sm')}</button>` : ''}</td></tr>`; }).join('') || `<tr><td colspan="7">${emptyBox('No documents found')}</td></tr>`}</tbody></table></div><div class="pager"><small>${list.length} document(s) in demo repository</small><span class="chip">Session ${esc(activeSchoolSession().name)}</span></div></div>
      ${canAdd ? sectionCard('Add Document', 'Simulated upload — no file leaves the browser', `<form class="card-pad" data-form="doc-add"><div class="grid g2"><div class="field"><label for="docName">Document name</label><input id="docName" name="name" placeholder="e.g. Birth_Certificate_Student.pdf" required></div><div class="field"><label for="docType">Document type</label><select id="docType" name="type">${opts(DB.masters.documentTypes, 'Birth Certificate')}</select></div><div class="field"><label for="docStudent">Linked student</label><select id="docStudent" name="studentId"><option value="">Select student (optional)</option>${DB.students.slice(0, 60).map(s => `<option value="${s.id}">${esc(s.name)} (${esc(s.regNo)})</option>`).join('')}</select></div><div class="field"><label for="docSize">Size (demo)</label><input id="docSize" name="size" value="320 KB" maxlength="12"></div></div><div class="form-error" id="docError"></div><button class="btn btn-primary btn-sm mt-s" type="submit">${ic('plus', 'sm')} Add to repository</button><p class="hint mt-s">Demo action adds a metadata row only. No actual file is stored.</p></form>`) : ''}
      </div><div class="stack">${sectionCard('Repository Summary', 'Access overview', `<div class="card-pad"><div class="profile-rows"><div><span>Total documents</span><b>${docs.length}</b></div><div><span>Linked students</span><b>${new Set(docs.map(d => d.studentId)).size}</b></div><div><span>File types</span><b>${new Set(docs.map(d => d.type)).size}</b></div><div><span>Access</span><b>${role === 'parent' ? 'Child only' : role === 'office' ? 'Provisional' : 'School Admin'}</b></div></div></div>`)}${sectionCard('Required Documents', 'Admission checklist (demo)', `<div class="card-pad"><div class="list">${DB.masters.documentTypes.map(t => `<div class="list-item"><div><b>${esc(t)}</b><small>${docs.filter(d => d.type === t).length} on file</small></div><div class="r">${pill(docs.some(d => d.type === t) ? 'Available' : 'Missing', docs.some(d => d.type === t) ? 'green' : 'amber')}</div></div>`).join('')}</div></div>`)}</div></div>`;
}

/* ============================= audit trail ============================= */
function auditView() {
  if (!['admin', 'super'].includes(state.user.role)) {
    return pageHead('Audit Trail', 'Restricted screen.') + `<div class="card">${emptyBox('Access restricted', 'Audit trails are visible only to School Admin and Super Admin.')}</div>`;
  }
  let list = DB.audit;
  if (state.auditQ) list = filterList(list, state.auditQ, ['action', 'detail', 'user']);
  if (state.auditModule) list = list.filter(a => a.module === state.auditModule);
  const modules = [...new Set(DB.audit.map(a => a.module))];
  return pageHead('Audit Trail', 'Restricted to School Admin and Super Admin. Demo events are stored in memory and are not tamper-proof.', `<button class="btn btn-outline" data-act="export-audit">${ic('download', 'sm')} Export CSV</button><button class="btn btn-primary" data-act="print">${ic('print', 'sm')} Print</button>`)
    + `<div class="notice"><span class="mark">i</span><div><b>Restricted in the UI.</b> Navigation to this screen is limited to School Admin and Super Admin. In production, audit trails must be server-side, append-only and tamper-resistant.</div></div>`
    + `<div class="grid g4">${kpi('Audit Events', DB.audit.length, 'shield', '', 'Demo log')}${kpi('Modules Covered', modules.length, 'layers', 'blue', 'Action sources')}${kpi('Latest Event', DB.audit[0]?.date.split(' ').slice(0, 3).join(' ') || '—', 'clock', 'green', 'Most recent')}${kpi('Visibility', 'Admin only', 'id', 'amber', 'School & Super')}</div>`
    + `<div class="card table-card mt"><form class="filters" data-form="audit-filter"><div class="field search"><label>Search</label><span>${ic('search', 'sm')}</span><input name="q" value="${esc(state.auditQ)}" placeholder="User, action or detail"></div><div class="field"><label>Module</label><select name="module">${opts(modules, state.auditModule, 'All modules')}</select></div><button class="btn btn-primary btn-sm" type="submit">Apply</button><button class="btn btn-ghost btn-sm" type="button" data-act="reset-audit">Reset</button></form><div class="table-wrap"><table class="data"><thead><tr><th>Timestamp</th><th>User</th><th>Role</th><th>Module</th><th>Action</th><th>Detail</th></tr></thead><tbody>${list.map(a => `<tr><td><b>${esc(a.date)}</b></td><td>${esc(a.user)}</td><td>${esc(a.role)}</td><td>${pill(a.module, 'violet')}</td><td>${esc(a.action)}</td><td class="small">${esc(a.detail)}</td></tr>`).join('') || `<tr><td colspan="6">${emptyBox('No matching audit events')}</td></tr>`}</tbody></table></div><div class="pager"><small>${list.length} event(s) · demo audit trail</small><span class="chip">Restricted</span></div></div>`;
}

/* ============================= users, roles & permissions ============================= */
function userEditModal(id) {
  const u = DB.users.find(x => x.id === id);
  if (!u) return;
  $('#modalRoot').innerHTML = `<div class="modal-backdrop"><div class="modal" role="dialog" aria-modal="true" aria-label="Edit user">
    <div class="modal-head"><span class="modal-ico">${ic('user')}</span><div><h3>Edit User</h3><p>Update demo login details and role. Changes are not saved after reload.</p></div></div>
    <form class="modal-body" data-form="user-edit" data-id="${u.id}">
      <div class="field"><label>Full name</label><input name="name" value="${esc(u.name)}" required></div>
      <div class="field mt-s"><label>Username</label><input name="username" value="${esc(u.username)}" required></div>
      <div class="field mt-s"><label>Mobile</label><input name="mobile" value="${esc(u.mobile)}" maxlength="10" required></div>
      <div class="field mt-s"><label>Role</label><select name="role">${ROLE_KEYS.map(k => `<option value="${k}" ${u.role === k ? 'selected' : ''}>${esc(ROLES[k].label)}</option>`).join('')}</select></div>
      <div class="form-error" id="userEditError"></div>
      <div class="modal-foot" style="padding:16px 0 0"><button type="button" class="btn btn-outline" data-act="modal-cancel">Cancel</button><button class="btn btn-primary" type="submit">Save changes</button></div>
    </form>
  </div></div>`;
}
function usersView() {
  const users = DB.users;
  const roles = ROLE_KEYS;
  const active = users.filter(u => u.status === 'Active').length;
  return pageHead('Users, Roles & Permissions', 'Manage demo logins, reset credentials and review role-based access. Scope and role names are configurable placeholders.', `<button class="btn btn-outline" data-act="nav" data-view="admins">${ic('shield', 'sm')} School Admins</button><button class="btn btn-primary" data-act="nav" data-view="audit">Audit Trail</button>`)
    + `<div class="grid g4">${kpi('Total Users', users.length, 'users')}${kpi('Active Users', active, 'check', 'green', 'Can sign in')}${kpi('Disabled', users.length - active, 'lock', 'amber', 'Access suspended')}${kpi('Roles', roles.length, 'shield', 'blue', 'Demo role matrix')}</div>`
    + `<div class="notice mt"><span class="mark">i</span><div><b>Provisional permissions.</b> Role names and access scope are placeholders to demonstrate the SOW's role-based access requirement. End-user authorization must be confirmed before build.</div></div>`
    + `<div class="grid g-3-1 mt"><div class="stack">${sectionCard('User Accounts', `${users.length} accounts`, `<div class="table-wrap"><table class="data"><thead><tr><th>Name</th><th>Username</th><th>Mobile</th><th>Role</th><th>Last Login</th><th>Status</th><th></th></tr></thead><tbody>${users.map(u => `<tr><td><div class="user-cell"><span class="avatar sm">${esc(initials(u.name))}</span><div><b>${esc(u.name)}</b><small>${esc(u.email || u.username + '@demo.local')}</small></div></div></td><td>${esc(u.username)}</td><td>${esc(u.mobile)}</td><td>${pill(ROLES[u.role]?.label || u.role, 'violet')}</td><td>${esc(u.last || u.lastLogin || 'Never')}</td><td>${statusPill(u.status)}</td><td class="right row-actions"><button class="btn-icon icon-btn" title="Edit user" data-act="user-edit" data-id="${u.id}">${ic('edit', 'sm')}</button><button class="btn-icon icon-btn" title="Reset password" data-act="user-reset" data-id="${u.id}">${ic('key', 'sm')}</button><button class="btn-icon icon-btn ${u.status === 'Active' ? 'danger' : ''}" title="${u.status === 'Active' ? 'Disable' : 'Enable'}" data-act="user-toggle" data-id="${u.id}">${ic(u.status === 'Active' ? 'lock' : 'check', 'sm')}</button></td></tr>`).join('')}</tbody></table></div><div class="pager"><small>Reset password is simulated and displays a demo confirmation.</small><span class="chip">10 demo roles</span></div>`)}</div>
    <div class="stack">${sectionCard('Add User', 'Demo account', `<form class="card-pad" data-form="user-add"><div class="field"><label for="uName">Full name</label><input id="uName" name="name" required></div><div class="field mt-s"><label for="uUser">Username</label><input id="uUser" name="username" required></div><div class="field mt-s"><label for="uMobile">Mobile</label><input id="uMobile" name="mobile" maxlength="10" inputmode="numeric" required></div><div class="field mt-s"><label for="uRole">Role</label><select id="uRole" name="role">${ROLE_KEYS.map(k => `<option value="${k}">${esc(ROLES[k].label)}</option>`).join('')}</select></div><div class="form-error" id="userError"></div><button class="btn btn-primary btn-block mt-s" type="submit">${ic('plus', 'sm')} Add user</button></form>`)}${sectionCard('Role Permissions', 'Screen access in this demo', `<div class="table-wrap"><table class="data compact"><thead><tr><th>Role</th><th>Screens</th><th>Restriction</th></tr></thead><tbody>${roles.map(k => `<tr><td><b>${esc(ROLES[k].label)}</b></td><td>${(NAV[k] || []).reduce((n, g) => n + g.items.length, 0)}</td><td class="small">${esc(ROLES[k].desc)}</td></tr>`).join('')}</tbody></table></div>`)}</div></div>`;
}

/* ============================= my school ============================= */
function schoolView() {
  const s = DB.school;
  return pageHead('My School', 'Institution profile, identifiers and demo configuration. Changes apply to this browser session only.', `<button class="btn btn-outline" data-act="nav" data-view="sessions">${ic('calendar', 'sm')} Sessions</button><button class="btn btn-primary" data-act="nav" data-view="masters">School Masters</button>`)
    + `<div class="grid g-3-1"><div class="stack"><div class="card"><div class="school-head"><span class="school-mark">${ic('school')}</span><div><span class="eyebrow">Institution profile</span><h2>${esc(s.name)}</h2><p>${esc(s.board)} &middot; ${esc(s.city)}, ${esc(s.state)} &middot; Established ${esc(s.established)}</p></div></div><div class="chips mt">${pill('Session ' + activeSchoolSession().name, 'green')}${pill(s.idLabel + ' format', 'violet')}${pill('Multi-branch ready', 'blue')}</div></div>
      ${sectionCard('School Details', 'Editable in this session', `<form class="card-pad" data-form="school-save"><div class="grid g2"><div class="field"><label>School name</label><input name="name" value="${esc(s.name)}" required></div><div class="field"><label>ID label</label><input name="idLabel" value="${esc(s.idLabel)}" required maxlength="20"></div><div class="field"><label>Board</label><input name="board" value="${esc(s.board)}"></div><div class="field"><label>Affiliation No.</label><input name="affiliation" value="${esc(s.affiliation)}"></div><div class="field"><label>Phone</label><input name="phone" value="${esc(s.phone)}"></div><div class="field"><label>Email</label><input name="email" type="email" value="${esc(s.email)}"></div><div class="field"><label>Principal</label><input name="principal" value="${esc(s.principal)}"></div><div class="field"><label>Established</label><input name="established" value="${esc(s.established)}" maxlength="4"></div><div class="field field-wide"><label>Address</label><input name="address" value="${esc(s.address)}"></div></div><div class="form-error" id="schoolError"></div><button class="btn btn-primary mt-s" type="submit">${ic('check', 'sm')} Save school profile</button></form>`)}</div>
    <div class="stack">${sectionCard('At a Glance', 'Demo dataset', `<div class="card-pad"><div class="profile-rows"><div><span>Students</span><b>${DB.students.filter(x => !x.archived).length}</b></div><div><span>Staff accounts</span><b>${DB.users.filter(u => !['parent', 'student'].includes(u.role)).length}</b></div><div><span>Classes</span><b>${DB.masters.classes.length}</b></div><div><span>Sessions</span><b>${DB.sessions.length}</b></div><div><span>Documents</span><b>${DB.docs.length}</b></div><div><span>Branches</span><b>${DB.schools.length}</b></div></div></div>`)}${sectionCard('Branches / Schools', 'Multi-school group', `<div class="card-pad"><div class="list">${DB.schools.map(x => `<div class="list-item"><span class="doc-type">${esc(x.code)}</span><div><b>${esc(x.name)}</b><small>${esc(x.city)} &middot; ${esc(x.board)}</small></div><div class="r">${DB.school.id === x.id ? pill('Current', 'green') : '<span class="tiny muted">Demo</span>'}</div></div>`).join('')}</div>${state.user.role === 'super' ? '<button class="btn btn-outline btn-sm btn-block mt-s" data-act="nav" data-view="schools">Manage schools</button>' : ''}</div>`)}</div></div>`;
}

/* ============================= modules ============================= */
function modulesView() {
  const on = MODULE_DEFS.filter(m => m.enabled).length;
  return pageHead('School Modules', 'Enable the modules included in this demo. Module scope and subscription behaviour are illustrative; no licensing or billing is implemented.', `<button class="btn btn-outline" data-act="nav" data-view="schools">${ic('building', 'sm')} Schools</button><button class="btn btn-primary" data-act="nav" data-view="users">Users & Roles</button>`)
    + `<div class="notice warn"><span class="mark">i</span><div><b>Provisional scope.</b> Module names and inclusion are based on the SOW and this demo. Confirm licensed modules and role-level access before implementation.</div></div>`
    + `<div class="grid g4">${kpi('Configured Modules', MODULE_DEFS.length, 'layers')}${kpi('Enabled', on, 'check', 'green', 'In this demo')}${kpi('Disabled', MODULE_DEFS.length - on, 'lock', 'amber', 'Can be turned on')}${kpi('School Scope', DB.school.code, 'school', 'blue', 'Demo tenant')}</div>`
    + `<div class="grid g-3-1 mt"><div class="stack">${sectionCard('Module Configuration', 'Institution-wide toggles', `<div class="table-wrap"><table class="data"><thead><tr><th>Module</th><th>Key</th><th>Primary Users</th><th>Status</th><th></th></tr></thead><tbody>${MODULE_DEFS.map(m => `<tr><td><b>${esc(m.name)}</b><small class="muted">${esc(m.desc)}</small></td><td><code>${esc(m.key)}</code></td><td class="small">${esc(m.roles)}</td><td>${m.enabled ? pill('Enabled', 'green') : pill('Disabled', 'grey')}</td><td class="right"><label class="switch"><input type="checkbox" data-module="${m.key}" ${m.enabled ? 'checked' : ''}><span class="track"></span></label></td></tr>`).join('')}</tbody></table></div>`)}</div>
    <div class="stack">${sectionCard('Add Module', 'Demo configuration', `<form class="card-pad" data-form="module-add"><div class="field"><label for="modName">Module name</label><input id="modName" name="name" required maxlength="50"></div><div class="field mt-s"><label for="modDesc">Short description</label><input id="modDesc" name="desc" maxlength="80"></div><button class="btn btn-primary btn-block mt-s" type="submit">${ic('plus', 'sm')} Add module</button><p class="hint mt-s">New modules appear in this list only; they have no screens in the demo.</p></form>`)}${sectionCard('Module Notes', '', `<div class="card-pad"><div class="list"><div class="list-item"><span class="stat-icon blue">${ic('layers', 'sm')}</span><div><b>Subscription</b><small>Not implemented — scope to be confirmed.</small></div></div><div class="list-item"><span class="stat-icon amber">${ic('shield', 'sm')}</span><div><b>Entitlements</b><small>Role-level module access is provisional.</small></div></div><div class="list-item"><span class="stat-icon green">${ic('building', 'sm')}</span><div><b>Multi-school</b><small>Configuration is shared in this demo.</small></div></div></div></div>`)}</div></div>`;
}

/* ============================= schools (super admin) ============================= */
function schoolsView() {
  if (state.user.role !== 'super') return pageHead('Schools', 'Restricted screen.') + `<div class="card">${emptyBox('Access restricted', 'Only the Super Admin can manage multiple schools.')}</div>`;
  const active = DB.schools.filter(s => s.status === 'active').length;
  const total = DB.schools.reduce((n, s) => n + (s.students || 0), 0);
  return pageHead('Schools & Branches', 'Super Admin workspace across the demo school group. Branch-level student data is illustrative in this prototype.', `<button class="btn btn-outline" data-act="nav" data-view="modules">${ic('settings', 'sm')} Modules</button><button class="btn btn-primary" data-act="nav" data-view="admins">School Admins</button>`)
    + `<div class="grid g4">${kpi('Schools', DB.schools.length, 'building')}${kpi('Active', active, 'check', 'green', 'In demo group')}${kpi('Students (declared)', total, 'users', 'blue', 'Across branches')}${kpi('Current School', DB.school.code, 'school', 'amber', 'Demo dataset')}</div>`
    + `<div class="grid g-3-1 mt"><div class="stack"><div class="grid g2">${DB.schools.map(s => `<div class="card school-card"><div class="school-card-head"><span class="school-tile">${esc(s.initials)}</span><div><h3>${esc(s.name)}</h3><p>${esc(s.code)} &middot; ${esc(s.city)}</p></div>${s.status === 'active' ? pill('Active', 'green') : pill('Archived', 'grey')}</div><div class="profile-rows"><div><span>Board</span><b>${esc(s.board || 'CBSE')}</b></div><div><span>Students</span><b>${s.students || 0}</b></div><div><span>Modules</span><b>${Object.values(s.modules || {}).filter(Boolean).length}</b></div><div><span>Phone</span><b class="small">${esc(s.phone)}</b></div></div><p class="small muted school-addr">${esc(s.address)}</p><div class="row between"><div class="row">${s.id === DB.school.id ? '<span class="chip on">Current demo school</span>' : ''}${s.status === 'active' ? pill('Branch', 'blue') : ''}</div><div class="row"><button class="link-btn" data-act="school-toggle" data-id="${s.id}">${s.status === 'active' ? 'Archive' : 'Activate'}</button><button class="btn btn-outline btn-sm" data-act="school-open" data-id="${s.id}">View</button></div></div></div>`).join('')}</div></div>
      <div class="stack">${sectionCard('Add School', 'Demo tenant', `<form class="card-pad" data-form="school-add"><div class="field"><label for="scName">School name</label><input id="scName" name="name" required></div><div class="field mt-s"><label for="scCode">Short code</label><input id="scCode" name="code" required maxlength="10" placeholder="e.g. SPS-AG"></div><div class="grid g2 mt-s"><div class="field"><label for="scCity">City</label><input id="scCity" name="city" required></div><div class="field"><label for="scState">State</label><input id="scState" name="state" value="Uttar Pradesh"></div></div><div class="field mt-s"><label for="scPhone">Phone</label><input id="scPhone" name="phone"></div><div class="form-error" id="schoolAddError"></div><button class="btn btn-primary btn-block mt-s" type="submit">${ic('plus', 'sm')} Add school</button><p class="hint mt-s">New schools are configuration-only; they do not receive demo student data.</p></form>`)}${sectionCard('Multi-school Notes', 'Scope', `<div class="card-pad"><p class="report-note">The SOW requires a Super Admin able to manage multiple schools/branches. This demo shows group-level navigation, branch configuration and admin assignment. Cross-branch student records are not generated.</p></div>`)}</div></div>`;
}

/* ============================= school admins ============================= */
function adminsView() {
  if (state.user.role !== 'super') return pageHead('School Admins', 'Restricted screen.') + `<div class="card">${emptyBox('Access restricted', 'Only the Super Admin can manage school administrators.')}</div>`;
  return pageHead('School Admins', 'Assign administrators to schools and manage demo access. Super Admin access remains part of the demo RBAC matrix.', `<button class="btn btn-outline" data-act="nav" data-view="schools">${ic('building', 'sm')} Schools</button><button class="btn btn-primary" data-act="nav" data-view="users">Users & Roles</button>`)
    + `<div class="grid g4">${kpi('Admins', DB.admins.length, 'shield')}${kpi('Active', DB.admins.filter(a => a.status === 'Active').length, 'check', 'green', 'Can sign in')}${kpi('Schools Covered', new Set(DB.admins.map(a => a.schoolId)).size, 'building', 'blue', 'Demo group')}${kpi('Super Admin', DB.schools.length, 'layers', 'amber', 'All branches')}</div>`
    + `<div class="grid g-3-1 mt"><div class="stack">${sectionCard('Administrators', 'School and Super Admin assignments', `<div class="table-wrap"><table class="data"><thead><tr><th>Name</th><th>Login</th><th>School</th><th>Role</th><th>Status</th><th>Last Login</th><th></th></tr></thead><tbody>${DB.admins.map(a => `<tr><td><div class="user-cell"><span class="avatar sm">${esc(initials(a.name))}</span><div><b>${esc(a.name)}</b><small>${esc(a.email)}</small></div></div></td><td>${esc(a.username || (a.email || '').split('@')[0])}<small class="muted">${esc(a.mobile)}</small></td><td>${esc(DB.schools.find(s => s.id === a.schoolId)?.name || 'All schools')}</td><td>${pill(a.role || 'School Admin', 'violet')}</td><td>${statusPill(a.status)}</td><td>${esc(a.lastLogin || a.last || 'Never')}</td><td class="right"><button class="link-btn" data-act="admin-toggle" data-id="${a.id}">${a.status === 'Active' ? 'Disable' : 'Enable'}</button></td></tr>`).join('')}</tbody></table></div>`)}</div>
    <div class="stack">${sectionCard('Add School Admin', 'Demo credentials', `<form class="card-pad" data-form="admin-add"><div class="field"><label for="adName">Full name</label><input id="adName" name="name" required></div><div class="field mt-s"><label for="adUser">Username</label><input id="adUser" name="username" required></div><div class="field mt-s"><label for="adMobile">Mobile</label><input id="adMobile" name="mobile" maxlength="10" required></div><div class="field mt-s"><label for="adEmail">Email</label><input id="adEmail" name="email" type="email"></div><div class="field mt-s"><label for="adSchool">School</label><select id="adSchool" name="schoolId">${DB.schools.map(s => `<option value="${s.id}">${esc(s.name)}</option>`).join('')}</select></div><div class="field mt-s"><label for="adRole">Role</label><select id="adRole" name="role"><option>School Admin</option><option>Super Admin</option></select></div><div class="form-error" id="adminError"></div><button class="btn btn-primary btn-block mt-s" type="submit">${ic('plus', 'sm')} Add administrator</button><p class="hint mt-s">Demo only. Password and OTP are simulated with 123456.</p></form>`)}</div></div>`;
}

/* ============================= admissions ============================= */
function admissionsView() {
  const all = mainStudents();
  const statuses = DB.masters.admissionStatuses;
  const counts = statuses.map(st => ({ st, n: all.filter(s => s.admissionStatus === st).length }));
  let list = all.filter(s => s.admissionStatus !== 'Completed');
  if (state.admQ) list = filterList(list, state.admQ, ['name', 'regNo', 'fatherName', 'mobile']);
  if (state.admStatus) list = list.filter(s => s.admissionStatus === state.admStatus);
  return pageHead('Admissions', 'Track admission enquiries and form status from enquiry to completion. Fees and payment workflow are not included in the SOW.', `<button class="btn btn-outline" data-act="nav" data-view="documents">${ic('folder', 'sm')} Documents</button><button class="btn btn-primary" data-act="new-student">${ic('plus', 'sm')} New Admission</button>`)
    + `<div class="notice"><span class="mark">i</span><div><b>Admission workflow is illustrative.</b> Status stages are driven by the Admission Status master. Fees, payments and approvals are outside the stated SOW scope.</div></div>`
    + `<div class="pipeline">${counts.map(c => `<div class="pipe"><span class="pdot"></span><div><b>${esc(c.st)}</b><small>${c.n} student(s)</small></div></div>`).join('')}</div>`
    + `<div class="grid g-3-1 mt"><div class="stack"><div class="card table-card"><form class="filters" data-form="adm-filter"><div class="field search"><label>Search</label><span>${ic('search', 'sm')}</span><input name="q" value="${esc(state.admQ)}" placeholder="Name, ID, father or mobile"></div><div class="field"><label>Admission status</label><select name="status">${opts(statuses, state.admStatus, 'All pending')}</select></div><button class="btn btn-primary btn-sm" type="submit">Apply</button><button class="btn btn-ghost btn-sm" type="button" data-act="reset-adm">Reset</button></form><div class="table-wrap"><table class="data"><thead><tr><th>Applicant</th><th>Class</th><th>Father / Contact</th><th>Admission Status</th><th>Form</th><th>Documents</th><th></th></tr></thead><tbody>${list.map(s => { const n = DB.docs.filter(d => d.studentId === s.id && !d.archived).length; return `<tr><td><div class="user-cell"><span class="avatar sm">${esc(initials(s.name))}</span><div><b>${esc(s.name)}</b><small>${esc(s.regNo)} &middot; ${esc(fmtDate(s.admissionDate))}</small></div></div></td><td>${esc(s.className)} ${esc(s.section)}</td><td>${esc(s.fatherName)}<small class="muted">${esc(s.mobile)}</small></td><td>${statusPill(s.admissionStatus)}</td><td>${esc(s.formNo || '—')}</td><td>${n ? pill(n + ' on file', 'green') : pill('Pending', 'amber')}</td><td class="right row-actions"><button class="btn-icon icon-btn" title="Open student" data-act="view-student" data-id="${s.id}">${ic('eye', 'sm')}</button><button class="link-btn" data-act="adm-next" data-id="${s.id}">Advance</button></td></tr>`; }).join('') || `<tr><td colspan="7">${emptyBox('No admission records match')}</td></tr>`}</tbody></table></div><div class="pager"><small>${list.length} pending admission record(s)</small><span class="chip">Front office</span></div></div></div>
      <div class="stack">${sectionCard('Pipeline', 'Status breakdown', `<div class="card-pad">${counts.map(c => `<div class="strength-row"><b>${esc(c.st)}</b><div class="bar"><span style="width:${all.length ? Math.round(c.n / all.length * 100) : 0}%"></span></div><span class="num">${c.n}</span></div>`).join('')}</div>`)}${sectionCard('New Admission Checklist', 'Demo guide', `<div class="card-pad"><div class="list"><div class="list-item"><span class="stat-icon blue">${ic('id', 'sm')}</span><div><b>Student details</b><small>Add core identity and class.</small></div></div><div class="list-item"><span class="stat-icon amber">${ic('users', 'sm')}</span><div><b>Parent details</b><small>Father, mother and guardian.</small></div></div><div class="list-item"><span class="stat-icon green">${ic('folder', 'sm')}</span><div><b>Documents</b><small>Attach demo admission documents.</small></div></div></div><button class="btn btn-primary btn-sm btn-block mt-s" data-act="new-student">Start admission</button></div>`)}</div></div>`;
}

/* ============================= notices ============================= */
function noticesView() {
  const role = state.user.role;
  const canPost = ['admin', 'office', 'principal'].includes(role);
  const list = DB.notices.filter(n => (n.audience || []).includes(role));
  return pageHead('Notices & Circulars', 'School announcements targeted by role. Read state is simulated in this browser session.', canPost ? `<button class="btn btn-primary" data-act="notice-add-focus">${ic('plus', 'sm')} New Notice</button>` : '')
    + `<div class="grid g4">${kpi('Notices', list.length, 'bell')}${kpi('Pinned', list.filter(n => n.pinned).length, 'pin', 'amber', 'Priority items')}${kpi('Unread', list.filter(n => !n.read).length, 'mail', 'blue', 'Demo read state')}${kpi('Audience', ROLES[role].label, 'users', 'green', 'Role targeted')}</div>`
    + `<div class="grid g-3-1 mt"><div class="stack">${list.map(n => `<div class="card notice-card ${n.pinned ? 'pinned' : ''}"><div class="notice-top"><div class="row">${n.pinned ? pill('Pinned', 'amber') : ''}<span class="chip">${esc(fmtDate(n.date))}</span></div><div class="row"><button class="link-btn" data-act="notice-read" data-id="${n.id}">${n.read ? 'Mark unread' : 'Mark read'}</button>${canPost ? `<button class="link-btn" data-act="notice-pin" data-id="${n.id}">${n.pinned ? 'Unpin' : 'Pin'}</button><button class="link-btn danger" data-act="notice-del" data-id="${n.id}">Delete</button>` : ''}</div></div><h3>${esc(n.title)}</h3><p>${esc(n.body)}</p><div class="notice-foot">${pill(n.read ? 'Read' : 'Unread', n.read ? 'grey' : 'violet')}<span class="small muted">Audience: ${(n.audience || []).map(a => ROLES[a]?.label || a).join(', ')}</span></div></div>`).join('') || `<div class="card">${emptyBox('No notices for this role')}</div>`}</div>
    <div class="stack">${canPost ? sectionCard('Publish Notice', 'Demo announcement', `<form class="card-pad" id="noticeForm" data-form="notice-add"><div class="field"><label for="ntTitle">Title</label><input id="ntTitle" name="title" required maxlength="90"></div><div class="field mt-s"><label for="ntBody">Message</label><textarea id="ntBody" name="body" required rows="5" maxlength="360"></textarea></div><div class="field mt-s"><label for="ntAudience">Audience</label><select id="ntAudience" name="audience">${ROLE_KEYS.map(k => `<option value="${k}">${esc(ROLES[k].label)}</option>`).join('')}<option value="all">All roles</option></select></div><div class="form-error" id="noticeError"></div><button class="btn btn-primary btn-block mt-s" type="submit">${ic('send', 'sm')} Publish notice</button><p class="hint mt-s">Notices are stored in memory and reset on reload.</p></form>`) : sectionCard('Notice Board', 'Read-only for your role', `<div class="card-pad"><p class="report-note">Announcements are published by the School Office, Principal or School Admin. Use the notice cards to mark items read or unread.</p></div>`)}${sectionCard('Notice Summary', '', `<div class="card-pad"><div class="profile-rows"><div><span>Visible notices</span><b>${list.length}</b></div><div><span>Pinned</span><b>${list.filter(n => n.pinned).length}</b></div><div><span>Unread</span><b>${list.filter(n => !n.read).length}</b></div><div><span>Audience</span><b>${ROLES[role].label}</b></div></div></div>`)}</div></div>`;
}

/* ============================= profile ============================= */
function profileView() {
  const u = state.user;
  const navs = navItems();
  const isAdmin = ['admin', 'super'].includes(u.role);
  return pageHead('My Profile', 'Your demo account, role scope and session information.', `<button class="btn btn-outline" data-act="password">${ic('key', 'sm')} Change password</button><button class="btn btn-primary" data-act="logout">${ic('logout', 'sm')} Sign out</button>`)
    + `<div class="grid g-3-1"><div class="stack"><div class="card"><div class="profile-hero"><span class="avatar xl">${esc(initials(u.name))}</span><div><span class="eyebrow">${esc(ROLES[u.role].label)}</span><h2>${esc(u.name)}</h2><p>${esc(u.email || u.username + '@demo.local')} &middot; ${esc(u.mobile)}</p><div class="row mt-s">${pill('Active', 'green')}${pill('Demo account', 'violet')}</div></div></div></div>
      ${sectionCard('Account Details', 'Demo profile', `<div class="card-pad"><div class="profile-rows"><div><span>Username</span><b>${esc(u.username)}</b></div><div><span>Mobile</span><b>${esc(u.mobile)}</b></div><div><span>Email</span><b>${esc(u.email || 'Not set')}</b></div><div><span>Role</span><b>${esc(ROLES[u.role].label)}</b></div><div><span>School</span><b>${esc(DB.school.name)}</b></div><div><span>Session</span><b>${esc(activeSchoolSession().name)}</b></div><div><span>Last login</span><b>${esc(u.lastLogin || 'This session')}</b></div><div><span>Auth</span><b>OTP demo</b></div></div></div>`)}
      ${u.role === 'parent' ? sectionCard('My Children', 'Linked student records', `<div class="card-pad">${mainStudents().map(s => `<div class="list-item"><span class="avatar sm">${esc(initials(s.name))}</span><div><b>${esc(s.name)}</b><small>${esc(s.className)} ${esc(s.section)} &middot; ${esc(s.regNo)}</small></div><div class="r"><button class="link-btn" data-act="view-student" data-id="${s.id}">View</button></div></div>`).join('')}</div>`) : ''}
      ${isAdmin ? sectionCard('Recent Activity', 'Audit preview', `<div class="card-pad">${auditMini(5)}</div>`) : ''}
    </div><div class="stack">${sectionCard('Role Scope', 'Screens available to this role', `<div class="card-pad"><div class="chips">${navs.map(n => n.id ? `<span class="chip on">${esc(n.label)}</span>` : `<button class="chip" data-act="nav" data-view="${n.v}">${esc(n.label)}</button>`).join('')}</div><div class="divider"></div><p class="report-note">${esc(ROLES[u.role].desc)}</p></div>`)}${sectionCard('Security', 'Frontend simulation', `<div class="card-pad"><div class="list"><div class="list-item"><span class="stat-icon blue">${ic('phone', 'sm')}</span><div><b>OTP sign-in</b><small>Demo OTP 123456. No SMS is sent.</small></div></div><div class="list-item"><span class="stat-icon amber">${ic('key', 'sm')}</span><div><b>Password</b><small>Change action is simulated only.</small></div></div><div class="list-item"><span class="stat-icon green">${ic('shield', 'sm')}</span><div><b>Session</b><small>Stored in sessionStorage on this device.</small></div></div></div></div>`)}${sectionCard('Help', 'Prototype', `<div class="card-pad"><p class="report-note">This is a frontend-only prototype. Do not enter real student or staff data. Use <b>Sign out</b> to return to the role selector.</p><button class="btn btn-outline btn-sm btn-block" data-act="logout">Sign out</button></div>`)}</div></div>`;
}

/* ============================= view registry ============================= */
const VIEWS = {
  dashboard: dashboardView, classes: classesView, students: studentsView, 'student-detail': studentDetailView, 'student-form': studentFormView,
  masters: mastersView, sessions: sessionsView, promotion: promotionView, reports: reportsView, verification: verificationView,
  photos: photosView, documents: documentsView, audit: auditView, users: usersView, school: schoolView, modules: modulesView,
  schools: schoolsView, admins: adminsView, admissions: admissionsView, notices: noticesView, profile: profileView
};

/* ============================= audit + export helpers ============================= */
function logAudit(module, action, detail) {
  DB.meta.auditSeq = (DB.meta.auditSeq || DB.audit.length) + 1;
  DB.audit.unshift({ id: 'a' + DB.meta.auditSeq, date: nowStamp(), user: state.user ? state.user.name : 'Demo User', role: state.user ? ROLES[state.user.role].label : 'Demo', module, action, detail });
  if (DB.audit.length > 200) DB.audit.length = 200;
}
function csvCell(v) { return '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"'; }
function downloadCsv(filename, headers, rows) {
  const csv = '\ufeff' + [headers.map(csvCell).join(',')].concat(rows.map(r => r.map(csvCell).join(','))).join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
function exportStudentRows(list, label) {
  downloadCsv(`${label || 'students'}-${activeSchoolSession().name}.csv`,
    ['Reg No', 'Admission No', 'Name', 'Class', 'Section', 'Roll', 'Gender', 'DOB', 'Father', 'Mother', 'Mobile', 'Status'],
    list.map(s => [s.regNo, s.admNo, s.name, s.className, s.section, s.rollNo, s.gender, s.dob, s.fatherName, s.motherName, s.mobile, s.studentStatus]));
  toast('CSV exported', `${list.length} student record(s) downloaded from the demo dataset.`);
}

/* ============================= click actions ============================= */
function handleClick(e) {
  const roleBtn = e.target.closest ? e.target.closest('[data-role]') : null;
  if (roleBtn) { selectRole(roleBtn.dataset.role, true); return; }
  const demoBtn = e.target.closest ? e.target.closest('[data-demo]') : null;
  if (demoBtn) { selectRole(demoBtn.dataset.demo, true); return; }
  const t = e.target.closest ? e.target.closest('[data-act]') : null;
  if (!t) return;
  const act = t.dataset.act;
  const id = t.dataset.id;
  switch (act) {
    case 'modal-cancel': closeModal(); break;
    case 'modal-ok': { const fn = pendingConfirm; closeModal(); if (fn) fn(); break; }
    case 'nav': go(t.dataset.view, id ? { id } : {}); break;
    case 'notifications': {
      if (navItems().some(i => i.v === 'notices')) go('notices');
      else toast('Notifications', `You have ${DB.notices.filter(n => n.audience.includes(state.user.role) && !n.read).length} unread demo notice(s).`, 'info');
      break;
    }
    case 'logout': confirmBox('Sign out?', 'Your demo session will be cleared and you will return to the role selector.', () => logout(), { ok: 'Sign out' }); break;
    case 'new-student': go('student-form'); break;
    case 'edit-student': go('student-form', { id }); break;
    case 'view-student': go('student-detail', { id }); break;
    case 'back-students': go('students'); break;
    case 'class-list': state.stu = { q: '', cls: t.dataset.cls, sec: t.dataset.sec, status: '', arch: '0' }; state.page = 1; go('students'); break;
    case 'page': state.page = Number(t.dataset.p); render(); break;
    case 'print': case 'print-current': window.print(); break;
    case 'export-students': exportStudentRows(filteredStudents(), 'student-master'); break;
    case 'export-report': {
      if (state.reportTab === 'strength') {
        const rows = classRows();
        downloadCsv(`class-strength-${activeSchoolSession().name}.csv`, ['Class', 'Section', 'Class Teacher', 'Total', 'Boys', 'Girls', 'Active'], rows.map(r => [r.cls, r.sec, CLASS_TEACHERS[r.cls + '|' + r.sec] || '', r.total, r.boys, r.girls, r.active]));
        toast('CSV exported', 'Class strength report downloaded.');
      } else exportStudentRows(reportRows(), 'student-report');
      break;
    }
    case 'export-udise': {
      const rows = mainStudents();
      downloadCsv(`udise-${activeSchoolSession().name}.csv`, ['Name', 'PEN', 'APAAR', 'Class', 'Gender', 'Category', 'Religion', 'Blood Group', 'RTE', 'Disability', 'Minority'],
        rows.map(s => [s.name, s.penNo, s.apaarId, s.className + ' ' + s.section, s.gender, s.socialCategory, s.religion, s.bloodGroup, s.rte, s.disability, s.minority]));
      toast('UDISE CSV exported', `${rows.length} records downloaded for review.`);
      break;
    }
    case 'export-audit': downloadCsv(`audit-${todayStr()}.csv`, ['Timestamp', 'User', 'Role', 'Module', 'Action', 'Detail'], DB.audit.map(a => [a.date, a.user, a.role, a.module, a.action, a.detail])); toast('Audit exported', 'Demo audit trail downloaded as CSV.'); break;
    case 'report-tab': state.reportTab = t.dataset.tab; render(); break;
    case 'toggle-col': {
      const k = t.dataset.col;
      state.reportCols = state.reportCols.includes(k) ? state.reportCols.filter(x => x !== k) : state.reportCols.concat(k);
      render();
      break;
    }
    case 'all-cols': state.reportCols = ['regNo', 'name', 'className', 'section', 'gender', 'fatherName', 'mobile']; render(); break;
    case 'reset-report': state.reportCls = ''; state.reportSec = ''; render(); break;
    case 'verify-submit': confirmBox('Mark verification complete?', `Record an audit event for the ${esc(state.user.role === 'class_teacher' ? CT_CLASS.join(' ') : state.verCls + ' ' + state.verSec)} verification sheet.`, () => { logAudit('Verification Sheet', 'Marked class sheet verified', `${state.user.role === 'class_teacher' ? CT_CLASS.join(' ') : state.verCls + ' ' + state.verSec} verification recorded (demo).`); toast('Verification recorded', 'Demo audit event added.'); }); break;
    case 'master-pick': state.masterKey = t.dataset.k; state.masterQ = ''; render(); break;
    case 'master-search': state.masterQ = ($('#masterSearch') || {}).value || ''; render(); break;
    case 'del-master': {
      const k = t.dataset.k, item = t.dataset.item;
      confirmBox('Remove master value?', `Remove "${item}" from the ${k} master? Existing student records are not rewritten in this demo.`, () => {
        DB.masters[k] = DB.masters[k].filter(x => x !== item);
        logAudit('Masters', 'Removed master value', `${item} removed from ${k}`);
        toast('Master updated', `${item} removed from the shared demo master.`);
        render();
      }, { danger: true, ok: 'Remove' });
      break;
    }
    case 'session-set': {
      const s = DB.sessions.find(x => x.id === id);
      confirmBox('Set current session?', `${s.name} will become the current academic session for this demo.`, () => {
        DB.sessions.forEach(x => { x.current = x.id === id; });
        logAudit('Academic Sessions', 'Set current session', `${s.name} set as current`);
        toast('Session updated', `${s.name} is now the current session.`);
        render();
      }, { ok: 'Set current' });
      break;
    }
    case 'user-edit': userEditModal(id); break;
    case 'user-reset': confirmBox('Reset demo credentials?', 'The password reset is simulated. No email or SMS is sent. Continue?', () => { logAudit('Users & Roles', 'Reset password', `Password reset simulated for ${esc(t.closest('tr')?.querySelector('b')?.textContent || 'user')}`); toast('Password reset simulated', 'Demo OTP remains 123456.'); }, { ok: 'Reset' }); break;
    case 'user-toggle': {
      const u = DB.users.find(x => x.id === id); if (!u) break;
      const next = u.status === 'Active' ? 'Disabled' : 'Active';
      u.status = next;
      logAudit('Users & Roles', next === 'Active' ? 'Enabled user' : 'Disabled user', `${u.name} (${u.username}) marked ${next}`);
      toast('User updated', `${u.name} is now ${next.toLowerCase()}.`);
      render();
      break;
    }
    case 'school-edit': go('school'); break;
    case 'school-open': {
      const s = DB.schools.find(x => x.id === id);
      if (s && s.id === DB.school.id) go('school');
      else toast('Branch profile', `${s ? s.name : 'Branch'} is a demo branch. Student-level data is only generated for ${DB.school.name}.`, 'info');
      break;
    }
    case 'school-toggle': {
      const s = DB.schools.find(x => x.id === id); if (!s) break;
      s.status = s.status === 'active' ? 'archived' : 'active';
      logAudit('Schools', 'Updated school status', `${s.name} marked ${s.status}`);
      toast('School updated', `${s.name} is now ${s.status}.`);
      render();
      break;
    }
    case 'admin-toggle': {
      const a = DB.admins.find(x => x.id === id); if (!a) break;
      a.status = a.status === 'Active' ? 'Disabled' : 'Active';
      logAudit('School Admins', a.status === 'Active' ? 'Enabled administrator' : 'Disabled administrator', `${a.name} marked ${a.status}`);
      toast('Administrator updated', `${a.name} is now ${a.status}.`);
      render();
      break;
    }
    case 'doc-dl': { const d = DB.docs.find(x => x.id === id); toast('Demo download', d ? `${d.name} is metadata only in this prototype.` : 'Document not found.', 'info'); break; }
    case 'doc-del': {
      const d = DB.docs.find(x => x.id === id);
      confirmBox('Archive document?', `Archive "${d.name}" from the demo repository?`, () => { d.archived = true; logAudit('Documents', 'Archived document', d.name); toast('Document archived', d.name); render(); }, { danger: true, ok: 'Archive' });
      break;
    }
    case 'view-docs': { const s = byId(id); if (s) docsModal(s); break; }
    case 'download-photos': toast('Demo download', 'Photo archive download is simulated. Uploaded photos are browser-only previews.', 'info'); break;
    case 'notice-read': { const n = DB.notices.find(x => x.id === id); if (n) { n.read = !n.read; render(); } break; }
    case 'notice-pin': { const n = DB.notices.find(x => x.id === id); if (n) { n.pinned = !n.pinned; toast(n.pinned ? 'Notice pinned' : 'Notice unpinned', n.title); render(); } break; }
    case 'notice-del': {
      const n = DB.notices.find(x => x.id === id);
      confirmBox('Delete notice?', `Remove "${n.title}" from the demo notice board?`, () => { DB.notices = DB.notices.filter(x => x.id !== id); logAudit('Notices', 'Deleted notice', n.title); toast('Notice deleted', n.title); render(); }, { danger: true, ok: 'Delete' });
      break;
    }
    case 'notice-add-focus': { const el = $('#ntTitle'); if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); el.focus(); } break; }
    case 'password': confirmBox('Change password?', 'Password change is simulated in this frontend prototype. No credentials are stored.', () => toast('Password unchanged', 'Demo authentication is fixed to OTP 123456.', 'info'), { ok: 'Continue' }); break;
    case 'adm-next': {
      const s = byId(id); if (!s) break;
      const stages = DB.masters.admissionStatuses;
      const idx = stages.indexOf(s.admissionStatus);
      if (idx < stages.length - 1) {
        s.admissionStatus = stages[idx + 1];
        logAudit('Admissions', 'Advanced admission status', `${s.name} moved to ${s.admissionStatus}`);
        toast('Admission updated', `${s.name} moved to ${s.admissionStatus}.`);
      } else toast('Final status', `${s.name} is already marked ${s.admissionStatus}.`, 'info');
      render();
      break;
    }
    case 'archive-student': {
      const s = byId(id);
      confirmBox('Archive student?', `Archive ${s.name}? The record stays in demo storage and the School Admin can restore it.`, () => { s.archived = true; logAudit('Student Master', 'Archived student', `${s.name} (${s.regNo}) archived`); toast('Student archived', s.name); go('students'); }, { danger: true, ok: 'Archive' });
      break;
    }
    case 'restore-student': {
      const s = byId(id);
      confirmBox('Restore student?', `Restore ${s.name} to the active student list?`, () => { s.archived = false; logAudit('Student Master', 'Restored student', `${s.name} (${s.regNo}) restored`); toast('Student restored', s.name); go('students'); }, { ok: 'Restore' });
      break;
    }
    case 'clear-photo': {
      state.formPhoto = null;
      const av = $('#formAvatar');
      if (av) av.innerHTML = esc(initials(($('#s_name') || {}).value || 'New Student'));
      t.remove();
      const inp = $('#photoFile'); if (inp) inp.value = '';
      break;
    }
  }
}

/* ============================= form submissions ============================= */
function formValue(form, name) { const el = form.querySelector(`[name="${name}"]`); return el ? String(el.value || '').trim() : ''; }
function showFormError(id, msg) { if (!id) return toast('Check the form', msg, 'error'); const el = document.getElementById(id); if (el) { el.textContent = msg; el.scrollIntoView({ behavior: 'smooth', block: 'center' }); } else toast('Check the form', msg, 'error'); }
function saveStudent(form) {
  const data = {};
  form.querySelectorAll('[data-k]').forEach(el => { data[el.dataset.k] = el.value.trim(); });
  const required = ['name', 'gender', 'dob', 'admissionDate', 'className', 'section', 'mobile', 'address'];
  const labels = { name: 'Full name', gender: 'Gender', dob: 'Date of birth', admissionDate: 'Admission date', className: 'Class', section: 'Section', mobile: 'Mobile number', address: 'Address' };
  for (const k of required) if (!data[k]) return showFormError('formError', `${labels[k]} is required.`);
  if (data.mobile && !/^[6-9]\d{9}$/.test(data.mobile)) return showFormError('formError', 'Mobile number must be a valid 10-digit Indian mobile number.');
  if (data.pincode && !/^\d{6}$/.test(data.pincode)) return showFormError('formError', 'PIN code must be 6 digits.');
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return showFormError('formError', 'Enter a valid email address.');
  if (data.dob && new Date(data.dob) > new Date()) return showFormError('formError', 'Date of birth cannot be in the future.');
  if (data.admissionDate && new Date(data.admissionDate) > new Date()) return showFormError('formError', 'Admission date cannot be in the future.');
  if (data.dob && data.admissionDate && new Date(data.dob) >= new Date(data.admissionDate)) return showFormError('formError', 'Date of birth must be before the admission date.');
  const editId = form.dataset.id;
  const existing = editId ? byId(editId) : null;
  if (existing) {
    const snapshot = { name: existing.name, className: existing.className, section: existing.section, mobile: existing.mobile, admissionStatus: existing.admissionStatus };
    const changed = Object.keys(snapshot).filter(k => snapshot[k] !== data[k]);
    Object.assign(existing, {
      name: data.name, gender: data.gender, dob: data.dob, admissionDate: data.admissionDate, className: data.className, section: data.section,
      subSection: data.subSection, rollNo: data.rollNo || existing.rollNo, studentStatus: data.studentStatus, admissionStatus: data.admissionStatus, house: data.house,
      siblings: data.siblings, siblingDetails: data.siblingDetails, regNo: data.regNo || existing.regNo, admNo: data.admNo || existing.admNo, penNo: data.penNo,
      apaarId: data.apaarId, formNo: data.formNo, mobile: data.mobile, email: data.email, state: data.state, district: data.district, pincode: data.pincode,
      address: data.address, transport: data.transport, socialCategory: data.socialCategory, caste: data.caste, religion: data.religion, motherTongue: data.motherTongue,
      bloodGroup: data.bloodGroup, nationality: data.nationality, country: data.country, weight: data.weight, height: data.height, disability: data.disability,
      minority: data.minority, bpl: data.bpl, rte: data.rte, remarks: data.remarks, fatherName: data.fatherName, fatherOccupation: data.fatherOccupation,
      fatherDepartment: data.fatherDepartment, fatherDesignation: data.fatherDesignation, fatherOrg: data.fatherOrg, fatherEmployee: data.fatherEmployee,
      fatherOrgAddress: data.fatherOrgAddress, fatherEmail: data.fatherEmail, fatherIncome: data.fatherIncome, fatherOfficePhone: data.fatherOfficePhone,
      fatherDob: data.fatherDob, fatherMobile: data.fatherMobile, motherName: data.motherName, motherOccupation: data.motherOccupation,
      motherDepartment: data.motherDepartment, motherDesignation: data.motherDesignation, motherOrg: data.motherOrg, motherEmployee: data.motherEmployee,
      motherOrgAddress: data.motherOrgAddress, motherEmail: data.motherEmail, motherIncome: data.motherIncome, motherOfficePhone: data.motherOfficePhone,
      motherDob: data.motherDob, motherMobile: data.motherMobile, guardianName: data.guardianName, guardianRelation: data.guardianRelation,
      guardianContact: data.guardianContact, guardianAddress: data.guardianAddress, prevSchoolName: data.prevSchoolName, prevSchoolAddress: data.prevSchoolAddress,
      prevSchoolBoard: data.prevSchoolBoard, prevSchoolPercentage: data.prevSchoolPercentage, prevTcNo: data.prevTcNo, photo: state.formPhoto
    });
    const cur = (existing.enrollments || []).find(e => e.session === activeSchoolSession().name);
    if (cur) { cur.class = existing.className; cur.section = existing.section; cur.roll = existing.rollNo; }
    existing.history = existing.history || [];
    existing.history.unshift({ date: nowStamp(), by: state.user.name, changes: changed.length ? 'Updated ' + changed.join(', ') : 'Student record reviewed and saved' });
    logAudit('Student Master', 'Edited student', `${existing.name} (${existing.regNo}) updated`);
    state.formPhoto = null;
    toast('Student updated', `${existing.name} saved. Previous values retained in change history.`);
    go('student-detail', { id: existing.id });
  } else {
    DB.meta.seq = (DB.meta.seq || DB.students.length) + 1;
    const seq = DB.meta.seq;
    const newId = 'st' + seq;
    const session = activeSchoolSession().name;
    let roll = data.rollNo;
    if (!roll) roll = String(DB.students.filter(s => s.className === data.className && s.section === data.section && !s.archived).length + 1);
    const regNo = data.regNo || `${DB.school.code.split('-')[0]}/${session.slice(0, 4)}/${String(seq).padStart(3, '0')}`;
    const admNo = data.admNo || `ADM-${String(seq).padStart(3, '0')}`;
    const student = Object.assign({}, data, {
      id: newId, rollNo: roll, regNo, admNo, session, photo: state.formPhoto, archived: false, createdAt: todayStr(),
      enrollments: [{ session, class: data.className, section: data.section, roll, result: 'Studying' }], history: []
    });
    DB.students.push(student);
    logAudit('Student Master', 'Added student', `${student.name} (${regNo}) added to ${data.className} ${data.section}`);
    state.formPhoto = null;
    toast('Student added', `${student.name} created with ${DB.school.idLabel} ${regNo}.`);
    go('student-detail', { id: newId });
  }
}

function handleSubmit(e) {
  const form = e.target;
  if (form.id === 'studentForm') { e.preventDefault(); saveStudent(form); return; }
  const kind = form.dataset.form;
  if (!kind) return;
  e.preventDefault();
  switch (kind) {
    case 'stu-filter': {
      state.stu = { q: formValue(form, 'q'), cls: formValue(form, 'cls'), sec: formValue(form, 'sec'), status: formValue(form, 'status'), arch: formValue(form, 'arch') || '0' };
      state.page = 1; render(); break;
    }
    case 'master-add': {
      const v = formValue(form, 'value');
      if (!v) return;
      if (DB.masters[state.masterKey].some(x => x.toLowerCase() === v.toLowerCase())) return showFormError('', 'That master value already exists.');
      DB.masters[state.masterKey].push(v);
      logAudit('Masters', 'Added master value', `${v} added to ${state.masterKey}`);
      state.masterQ = '';
      toast('Master value added', `${v} is available across demo forms and filters.`);
      render(); break;
    }
    case 'session-add': {
      const name = formValue(form, 'name'), start = formValue(form, 'start'), end = formValue(form, 'end');
      if (!/^\d{4}-\d{2}$/.test(name)) return showFormError('sesError', 'Use a session name like 2028-29.');
      if (DB.sessions.some(s => s.name === name)) return showFormError('sesError', 'This session already exists.');
      if (!start || !end || new Date(end) <= new Date(start)) return showFormError('sesError', 'Enter a valid start and end date.');
      DB.sessions.push({ id: 'ses' + (DB.sessions.length + 1), name, start, end, current: false });
      logAudit('Academic Sessions', 'Created session', `${name} created (${start} to ${end})`);
      toast('Session created', `${name} added as an upcoming session.`);
      render(); break;
    }
    case 'promo-filter': {
      state.promoSrc = formValue(form, 'src'); state.promoSection = formValue(form, 'sec');
      state.promoTargetSession = formValue(form, 'tsession'); state.promoTarget = nextClassOf(state.promoSrc);
      render(); break;
    }
    case 'promotion': {
      const selected = $$('.promo-check:checked').map(c => byId(c.value)).filter(Boolean);
      const target = formValue(form, 'target'), targetSec = formValue(form, 'targetSec'), targetSession = formValue(form, 'targetSession');
      if (!selected.length) return showFormError('promoError', 'Select at least one student to promote.');
      if (!target || !targetSession) return showFormError('promoError', 'Choose a target class and session.');
      if (DB.sessions.find(s => s.name === targetSession)?.current) return showFormError('promoError', 'Choose an upcoming or non-current session for promotion.');
      let rollStart = DB.students.filter(s => s.className === target && s.section === targetSec && !s.archived).length;
      selected.forEach((s, i) => {
        s.enrollments = s.enrollments || [];
        const cur = s.enrollments.find(x => x.session === activeSchoolSession().name);
        if (cur) cur.result = 'Promoted';
        const roll = String(rollStart + i + 1);
        s.enrollments.push({ session: targetSession, class: target, section: targetSec, roll, result: 'Studying' });
        s.history = s.history || [];
        s.history.unshift({ date: nowStamp(), by: state.user.name, changes: `Promoted from ${s.className} ${s.section} to ${target} ${targetSec} (${targetSession})` });
        s.className = target; s.section = targetSec; s.rollNo = roll;
      });
      logAudit('Student Promotion', 'Promoted students', `${selected.length} student(s) promoted to ${target} ${targetSec} for ${targetSession}`);
      toast('Promotion complete', `${selected.length} student(s) moved to ${target} ${targetSec} and history was preserved.`);
      render(); break;
    }
    case 'report-filter': state.reportCls = formValue(form, 'cls'); state.reportSec = formValue(form, 'sec'); render(); break;
    case 'ver-filter': state.verCls = formValue(form, 'cls'); state.verSec = formValue(form, 'sec'); render(); break;
    case 'photo-filter': state.photoCls = formValue(form, 'cls'); render(); break;
    case 'doc-filter': state.docQ = formValue(form, 'q'); state.docType = formValue(form, 'type'); render(); break;
    case 'doc-add': {
      const name = formValue(form, 'name');
      if (!name) return showFormError('docError', 'Document name is required.');
      DB.meta.docSeq = (DB.meta.docSeq || DB.docs.length) + 1;
      DB.docs.unshift({ id: 'd' + DB.meta.docSeq, name, type: formValue(form, 'type') || 'Other', studentId: formValue(form, 'studentId'), date: todayStr(), size: formValue(form, 'size') || '320 KB', by: state.user.name, archived: false });
      logAudit('Documents', 'Added document', `${name} added to demo repository`);
      toast('Document added', `${name} added as metadata only.`);
      render(); break;
    }
    case 'audit-filter': state.auditQ = formValue(form, 'q'); state.auditModule = formValue(form, 'module'); render(); break;
    case 'user-add': {
      const name = formValue(form, 'name'), username = formValue(form, 'username'), mobile = formValue(form, 'mobile'), role = formValue(form, 'role');
      if (!/^[6-9]\d{9}$/.test(mobile)) return showFormError('userError', 'Enter a valid 10-digit mobile number.');
      if (DB.users.some(u => u.username.toLowerCase() === username.toLowerCase())) return showFormError('userError', 'That username is already in use.');
      DB.meta.userSeq = (DB.meta.userSeq || DB.users.length) + 1;
      DB.users.push({ id: 'u' + DB.meta.userSeq, name, username, mobile, role, status: 'Active', last: 'Never' });
      logAudit('Users & Roles', 'Created user', `${name} (${username}) created with role ${ROLES[role].label}`);
      toast('User added', `${name} can use the demo OTP 123456.`);
      render(); break;
    }
    case 'user-edit': {
      const u = DB.users.find(x => x.id === form.dataset.id); if (!u) return closeModal();
      const name = formValue(form, 'name'), username = formValue(form, 'username'), mobile = formValue(form, 'mobile'), role = formValue(form, 'role');
      if (!/^[6-9]\d{9}$/.test(mobile)) return showFormError('userEditError', 'Enter a valid 10-digit mobile number.');
      if (DB.users.some(x => x.id !== u.id && x.username.toLowerCase() === username.toLowerCase())) return showFormError('userEditError', 'That username is already in use.');
      Object.assign(u, { name, username, mobile, role });
      logAudit('Users & Roles', 'Edited user', `${u.name} (${u.username}) updated`);
      closeModal(); toast('User updated', `${u.name} saved.`); render(); break;
    }
    case 'school-save': {
      ['name', 'idLabel', 'board', 'affiliation', 'phone', 'email', 'principal', 'established', 'address'].forEach(k => { DB.school[k] = formValue(form, k); });
      logAudit('School Information', 'Updated school profile', `${DB.school.name} profile updated`);
      toast('School saved', 'School profile updated for this browser session.');
      render(); break;
    }
    case 'module-add': {
      const name = formValue(form, 'name');
      if (!name) return;
      const key = name.replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase()).replace(/^./, c => c.toLowerCase());
      if (MODULE_DEFS.some(m => m.key === key)) return showFormError('', 'A module with a similar key already exists.');
      MODULE_DEFS.push({ 0: key, 1: name, key, name, desc: formValue(form, 'desc') || 'Custom demo module', roles: 'Demo', enabled: true });
      logAudit('Modules', 'Added module', `${name} added to module configuration`);
      toast('Module added', `${name} appears in the configuration list.`);
      render(); break;
    }
    case 'school-add': {
      const name = formValue(form, 'name'), code = formValue(form, 'code').toUpperCase();
      if (DB.schools.some(s => s.code === code)) return showFormError('schoolAddError', 'That school code already exists.');
      DB.schools.push({ id: 'sch' + (DB.schools.length + 1), name, code, initials: name.split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase(), city: formValue(form, 'city'), state: formValue(form, 'state'), address: formValue(form, 'city') + ', ' + formValue(form, 'state'), phone: formValue(form, 'phone'), email: '', status: 'active', students: 0, modules: allModules() });
      logAudit('Schools', 'Added school', `${name} (${code}) added to demo group`);
      toast('School added', `${name} added as a configuration-only demo branch.`);
      render(); break;
    }
    case 'admin-add': {
      const name = formValue(form, 'name'), username = formValue(form, 'username'), mobile = formValue(form, 'mobile');
      if (!/^[6-9]\d{9}$/.test(mobile)) return showFormError('adminError', 'Enter a valid 10-digit mobile number.');
      if (DB.admins.some(a => (a.username || '').toLowerCase() === username.toLowerCase()) || DB.users.some(u => u.username.toLowerCase() === username.toLowerCase())) return showFormError('adminError', 'That username is already in use.');
      DB.admins.push({ id: 'sa' + (DB.admins.length + 1), name, username, email: formValue(form, 'email') || username + '@example.com', mobile, schoolId: formValue(form, 'schoolId'), role: formValue(form, 'role') || 'School Admin', status: 'Active', lastLogin: 'Never' });
      logAudit('School Admins', 'Added administrator', `${name} assigned as ${formValue(form, 'role')}`);
      toast('Administrator added', `${name} added to the demo group.`);
      render(); break;
    }
    case 'adm-filter': state.admQ = formValue(form, 'q'); state.admStatus = formValue(form, 'status'); render(); break;
    case 'notice-add': {
      const title = formValue(form, 'title'), body = formValue(form, 'body'), audience = formValue(form, 'audience');
      if (!title || !body) return showFormError('noticeError', 'A title and message are required.');
      DB.notices.unshift({ id: 'n' + Date.now(), title, body, date: todayStr(), audience: audience === 'all' ? ROLE_KEYS.slice() : [audience], read: false, pinned: false });
      logAudit('Notices', 'Published notice', title);
      toast('Notice published', `Visible to ${audience === 'all' ? 'all roles' : ROLES[audience].label}.`);
      render(); break;
    }
  }
}

/* ============================= change events ============================= */
function readImage(file, done) {
  if (!file) return;
  if (!file.type.startsWith('image/')) return toast('Unsupported file', 'Choose a JPG or PNG image.', 'error');
  if (file.size > 2 * 1024 * 1024) return toast('File too large', 'Use an image smaller than 2 MB.', 'error');
  const reader = new FileReader();
  reader.onload = () => done(reader.result);
  reader.onerror = () => toast('Could not read file', 'Try another image.', 'error');
  reader.readAsDataURL(file);
}
function handleChange(e) {
  const t = e.target;
  if (t.id === 'promoAll') { $$('.promo-check').forEach(c => { c.checked = t.checked; }); return; }
  if (t.id === 'photoFile') {
    readImage(t.files && t.files[0], url => {
      state.formPhoto = url;
      const av = $('#formAvatar');
      if (av) av.innerHTML = `<img src="${url}" alt="Student photo preview">`;
      toast('Photo preview ready', 'Image is held in this browser only and is not uploaded.');
    });
    return;
  }
  if (t.dataset && t.dataset.photo) {
    const s = byId(t.dataset.photo);
    readImage(t.files && t.files[0], url => {
      if (!s) return;
      s.photo = url;
      logAudit('Photographs', 'Updated student photo', `${s.name} (${s.regNo}) photo updated`);
      toast('Photo updated', `${s.name}'s demo photo preview saved in memory.`);
      render();
    });
    return;
  }
  if (t.dataset && t.dataset.module) {
    const m = MODULE_DEFS.find(x => x.key === t.dataset.module);
    if (m) {
      m.enabled = t.checked;
      logAudit('Modules', t.checked ? 'Enabled module' : 'Disabled module', `${m.name} ${t.checked ? 'enabled' : 'disabled'}`);
      toast('Module updated', `${m.name} is now ${t.checked ? 'enabled' : 'disabled'}.`);
      render();
    }
  }
}

/* ============================= boot ============================= */
document.addEventListener('click', handleClick);
document.addEventListener('submit', handleSubmit);
document.addEventListener('change', handleChange);
initLogin();
