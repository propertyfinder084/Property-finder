// English <-> Arabic switch for the admin portal. Text is translated in the page itself,
// so every screen follows the language chosen at the top right.
const AR = {
  'Overview': 'نظرة عامة', 'Dashboard': 'لوحة التحكم', 'Analytics': 'التحليلات', 'Verification': 'التوثيق',
  'Broker Verification': 'توثيق الوسطاء', 'Property Verification': 'توثيق العقارات', 'Support': 'الدعم',
  'Complaints': 'الشكاوى', 'Support Chat': 'محادثات الدعم', 'All Chats': 'كل المحادثات', 'Business': 'الأعمال',
  'Payments': 'المدفوعات', 'Deals & Payouts': 'الصفقات والتحويلات', 'Deals & payouts': 'الصفقات والتحويلات',
  'All Users': 'كل المستخدمين', 'Visit Bookings': 'حجوزات الزيارات', 'Visit bookings': 'حجوزات الزيارات',
  'Enable desktop alerts': 'تفعيل تنبيهات سطح المكتب', 'Admin': 'المدير', 'Sign out': 'تسجيل الخروج', 'Sign in': 'تسجيل الدخول',
  'Admin portal': 'بوابة الإدارة', 'Email': 'البريد الإلكتروني', 'Password': 'كلمة المرور',
  'Approve': 'قبول', 'Reject': 'رفض', 'Decline': 'رفض', 'Accept': 'قبول', 'Accept broker': 'قبول الوسيط', 'Approve user': 'قبول المستخدم',
  'Approved': 'مقبول', 'Rejected': 'مرفوض', 'Declined': 'مرفوض', 'Pending': 'قيد الانتظار', 'Active': 'نشط', 'All': 'الكل',
  'Cancelled': 'ملغي', 'Resolved': 'تم الحل', 'Settled': 'تمت التسوية', 'Sent': 'أُرسل', 'Revoke': 'سحب',
  'Name': 'الاسم', 'Mobile': 'الجوال', 'Role': 'الدور', 'Joined': 'تاريخ الانضمام', 'Status': 'الحالة', 'Date': 'التاريخ', 'Time': 'الوقت',
  'Type': 'النوع', 'Price': 'السعر', 'Price (SAR)': 'السعر (ريال)', 'Area': 'المساحة', 'Location': 'الموقع', 'Listing': 'العقار',
  'Listings': 'العقارات', 'Properties': 'العقارات', 'Property': 'العقار', 'Users': 'المستخدمون', 'User': 'المستخدم', 'Broker': 'الوسيط',
  'broker': 'الوسيط', 'Brokers waiting': 'وسطاء بالانتظار', 'Approved brokers': 'الوسطاء المقبولون', 'Approved dealers': 'الوسطاء المقبولون',
  'Visits': 'الزيارات', 'Visitor': 'الزائر', 'Requested time': 'الوقت المطلوب', 'Other time': 'وقت آخر', 'Suggest another time': 'اقتراح وقت آخر',
  'Send to visitor': 'إرسال للزائر', 'Verified by': 'تم التأكيد بواسطة', 'Choose a date': 'اختر تاريخًا', 'No visits.': 'لا توجد زيارات.',
  'Commission': 'العمولة', 'Platform fee': 'رسوم المنصة', 'Broker gets': 'صافي الوسيط', 'Owner gets': 'صافي المالك', 'Admin keeps': 'حصة المنصة',
  'Buyer': 'المشتري', 'Deal': 'الصفقة', 'Amount': 'المبلغ', 'Method': 'الطريقة', 'Mark paid': 'تحديد كمدفوع', 'Payouts due': 'تحويلات مستحقة',
  'Waiting for buyer': 'بانتظار المشتري', 'No deals.': 'لا توجد صفقات.', 'No payments yet.': 'لا توجد مدفوعات بعد.',
  'Cash payment waiting': 'دفعة نقدية بالانتظار', 'Cash received': 'تم استلام النقد', 'Not received': 'لم يُستلم', 'cash waiting': 'نقد بالانتظار', 'collected': 'تم التحصيل',
  'Conversations': 'المحادثات', 'No chats yet.': 'لا توجد محادثات بعد.', 'Choose a conversation.': 'اختر محادثة.', 'Direct chat': 'محادثة مباشرة',
  'No support chats yet.': 'لا توجد محادثات دعم بعد.', 'Support message': 'رسالة دعم', 'Send': 'إرسال', 'Property Finder team': 'فريق Property Finder', 'Admin team': 'فريق الإدارة',
  'New complaint': 'شكوى جديدة', 'New listing': 'عقار جديد', 'New visit booking': 'حجز زيارة جديد', 'New time suggested': 'تم اقتراح وقت جديد',
  'No complaints.': 'لا توجد شكاوى.', 'Mark in review': 'قيد المراجعة', 'Resolve': 'حل', 'Close without action': 'إغلاق بدون إجراء', 'Subject': 'الموضوع', 'Contact': 'التواصل',
  'Handled by': 'تمت المعالجة بواسطة', 'To resolve': 'للحل', 'To review': 'للمراجعة', 'Review': 'مراجعة', 'View': 'عرض', 'Save': 'حفظ',
  'Documents': 'المستندات', 'ID documents': 'مستندات الهوية', 'ID number': 'رقم الهوية', 'Company': 'الشركة', 'Applicant': 'مقدم الطلب', 'Applied': 'تاريخ التقديم', 'Submitted': 'تاريخ الإرسال',
  'Uploaded documents': 'المستندات المرفوعة', 'No documents uploaded.': 'لم يتم رفع مستندات.', 'No applications in this list.': 'لا توجد طلبات في هذه القائمة.',
  'Commercial registration': 'السجل التجاري', 'Ownership document': 'مستند الملكية', 'Selfie / photo': 'صورة شخصية', 'No photos': 'لا توجد صور',
  'Property to verify': 'عقار للتوثيق', 'Broker to verify': 'وسيط للتوثيق', 'Listings to review': 'عقارات للمراجعة', 'Posted by': 'نشره', 'Open map': 'فتح الخريطة',
  'This listing has no map pin.': 'هذا العقار بلا موقع على الخريطة.', 'Nobody in this list.': 'لا أحد في هذه القائمة.', 'Nothing here.': 'لا شيء هنا.', 'Cannot load': 'تعذر التحميل',
  'Products & prices': 'المنتجات والأسعار', 'Product': 'المنتج', 'Requests': 'الطلبات', 'Days': 'الأيام', 'Registered': 'مسجل', 'Other': 'أخرى',
  'Detailed numbers about properties, visits and money.': 'أرقام تفصيلية عن العقارات والزيارات والأموال.',
  'Change the price or switch a product off. Prices are in SAR.': 'غيّر السعر أو أوقف المنتج. الأسعار بالريال.',
  'Rejection reason (shown to the broker)': 'سبب الرفض (يظهر للوسيط)', 'Your answer (the user sees this)': 'ردّك (يراه المستخدم)', 'Note (optional)': 'ملاحظة (اختياري)',
  '© 2026 Damac Hills. All rights reserved.': '© 2026 داماك هيلز. جميع الحقوق محفوظة.',
  'Search city, district, broker…': 'ابحث عن مدينة أو حي أو وسيط…', 'Search name, phone, email…': 'ابحث بالاسم أو الهاتف أو البريد…',
  'Write a reply…': 'اكتب رداً…', 'Write as Property Finder Admin…': 'اكتب باسم إدارة Property Finder…', 'We are not available then': 'غير متاحين في ذلك الوقت',
  'Explain what was done…': 'اشرح ما تم…', 'e.g. Deed does not match the location, photos unclear…': 'مثال: الصك لا يطابق الموقع، الصور غير واضحة…',
  'waiting for reply': 'بانتظار الرد', 'Language': 'اللغة',
}
const TAIL = [[/(\d+) items? need you/, (n) => `${n} عنصر يحتاج انتباهك`]]
const store = new WeakMap()

function tr(s, ar) {
  const t = s.trim()
  if (!t) return s
  let out = AR[t]
  if (!out) for (const [re, f] of TAIL) { const m = t.match(re); if (m) out = f(m[1]) }
  return out ? s.replace(t, out) : s
}

function walk(node, ar) {
  if (node.nodeType === 3) {
    const orig = store.get(node)
    if (ar) {
      const base = orig ?? node.nodeValue
      const out = tr(base)
      if (out !== base) { if (orig === undefined) store.set(node, base); node.nodeValue = out }
    } else if (orig !== undefined) { node.nodeValue = orig; store.delete(node) }
    return
  }
  if (node.nodeType !== 1 || /^(SCRIPT|STYLE)$/.test(node.tagName)) return
  for (const a of ['placeholder', 'title']) {
    if (node.hasAttribute(a)) {
      const key = 'data-en-' + a
      const en = node.getAttribute(key) ?? node.getAttribute(a)
      const out = ar ? tr(en) : en
      if (ar && out !== en) node.setAttribute(key, en)
      if (!ar) node.removeAttribute(key)
      if (node.getAttribute(a) !== out) node.setAttribute(a, out)
    }
  }
  node.childNodes.forEach((c) => walk(c, ar))
}

let ar = false
try { ar = localStorage.getItem('lang') === 'ar' } catch { /* ignore */ }
let busy = false
const obs = new MutationObserver(() => {
  if (busy || !ar) return
  busy = true
  walk(document.body, true)
  busy = false
})

export function isAr() { return ar }
export function applyLang() {
  document.documentElement.dir = ar ? 'rtl' : 'ltr'
  document.documentElement.lang = ar ? 'ar' : 'en'
  busy = true
  walk(document.body, ar)
  busy = false
}
export function setLang(v) {
  ar = v
  try { localStorage.setItem('lang', v ? 'ar' : 'en') } catch { /* ignore */ }
  applyLang()
}
export function startI18n() {
  obs.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['placeholder'] })
  applyLang()
}
