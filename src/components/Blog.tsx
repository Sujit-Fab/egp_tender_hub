import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Newspaper, ChevronRight, ArrowLeft, Calendar, Tag } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export const Blog = ({ lang }: { lang: 'en' | 'bn' }) => {
  const [activePostIdx, setActivePostIdx] = useState<number | null>(null);

  const posts = [
    {
      title: lang === 'bn' ? 'দরপত্র Non-Responsive কেন হয়? ১০টি সাধারণ কারণ ও সমাধান (২০২৫)' : 'Why Tenders Become Non-Responsive: 10 Common Reasons & How to Fix Them (2025)',
      excerpt: lang === 'bn' ? 'বেশিরভাগ ঠিকাদার bid করে হেরে যান eligibility-র ভুলে, দামে নয়। এই গাইডে দরপত্র non-responsive হওয়ার ১০টি আসল কারণ এবং প্রতিটির সমাধান।' : 'Most contractors lose bids on eligibility mistakes, not price. This guide breaks down the 10 real reasons tenders are declared non-responsive and how to fix each one.',
      date: 'Jun 17, 2026',
      category: 'Guide',
      contentEn: `
## Why Tenders Become Non-Responsive in Bangladesh (And How to Avoid It)

If you have ever submitted a bid on the **e-GP portal (eprocure.gov.bd)** only to find your tender marked "non-responsive," you already know the frustration. You spent days preparing documents, calculated your rates carefully, and still got knocked out before the price was even considered.

Here is the hard truth most contractors learn too late: **the majority of tenders fail on eligibility and documentation, not on price.** A single missing certificate or a liquid asset figure that falls short can disqualify an otherwise strong bid.

This guide breaks down the 10 most common reasons a tender is declared non-responsive under **PPR 2025**, and exactly how to fix each one before you bid.

---

### 1. Liquid Assets Below the Required Minimum
This is the number one silent killer. The tender specifies a minimum liquid asset (working capital or credit line) — for example, Tk. 65 Lakh. Many bidders show their gross figure and assume they qualify.

The mistake: the requirement is **net of other contractual commitments**. If you have Tk. 50 Lakh in liquid assets but Tk. 15 Lakh is already tied to ongoing work, your *available* liquid asset is only Tk. 35 Lakh — and you fail.

**Fix:** Always calculate your *net available* liquid assets before bidding. Submit the certificate in the correct format (Form e-PW2A-8) in original, within the specified period.

### 2. Missing or Expired Mandatory Documents
Trade License, TIN Certificate, VAT/BIN registration, the income tax acknowledgement slip — if any of these is missing, expired, or not covering the required fiscal year, your bid is non-responsive regardless of how strong everything else is.

**Fix:** Make a checklist of every document the TDS demands and verify each validity date before submission.

### 3. Key Personnel Requirements Not Met
The tender lists specific roles — Project Manager, Site Engineer (Civil), Site Engineer (Electrical), Manager, Foreman, and so on — each with minimum education and years of experience. A common failure is having a Project Manager but missing a required Electrical Site Engineer or Night Guard.

**Fix:** Map each required role against your actual staff, including their CVs and experience years (in the e-PW2A-5 form). If a role is committed to another ongoing project, it does not count as available.

### 4. Equipment Capacity Shortfall
Works tenders require specific equipment — concrete mixers, vibrators, levelling machines, compaction machines, re-bar cutting and welding machines. Missing even one type, or lacking the ownership/hire certificate, makes the bid non-responsive.

**Fix:** Match your equipment list (owned, hired, or leased) against the requirement, and prepare the supporting ownership or hire agreements.

### 5. Similar Work Experience Value Too Low
The tender asks for completed contracts of a similar nature, each above a minimum value, within the last few years — supported by a work completion certificate (not just a work order).

**Fix:** Keep your completion certificates organised and ensure at least one matches the value and nature required.

### 6. Tender Capacity Below Threshold
Tender Capacity is calculated using a formula (A×N×1.25 − B), where B is the value of your existing commitments. Bidders often forget to subtract B, overstating their capacity.

**Fix:** Calculate honestly. We cover this formula in detail in a separate guide.

### 7. Tender Security Issues
Wrong amount, wrong format, or expired validity of the e-Tender security can sink a bid instantly.

**Fix:** Follow the exact amount and validity stated in the IFT.

### 8. Bid Validity Period Too Short
If your tender is valid for a shorter period than the TDS requires (e.g. 120 days), it is automatically non-responsive.

**Fix:** Match the validity period exactly.

### 9. Significantly Low-Priced Tender (SLT) — New in PPR 2025
PPR 2025 introduced a formula-based SLT system. If your price is flagged as abnormally low against the market and official estimate, it can be declared non-responsive.

**Fix:** Price realistically. An unusually low bid is no longer a guaranteed win — it is now a risk.

### 10. Not Reading the Pre-Bid Meeting Clarifications
Many requirements are clarified at the pre-bid meeting. Skipping it means you may misread an ambiguous requirement.

**Fix:** Always attend or review pre-bid clarifications — the procuring entity's clarification overrides assumptions.

---

### The Smarter Way: Check Before You Bid

Going through all 10 points manually for every tender takes hours of careful reading of a long Standard Tender Document (STD). And one missed detail can still cost you the bid.

**This is exactly what eGPTenderHub does for you.** Upload the tender notice, and our AI checks every one of these criteria against your company profile — liquid assets (net of commitments), personnel, equipment, documents, and capacity — then tells you instantly whether you are eligible, and what is missing.

**Stop guessing. Check your eligibility in minutes at egptenderhub.com before you spend days on a bid you cannot win.**
      `,
      contentBn: `
## বাংলাদেশে দরপত্র Non-Responsive কেন হয় (এবং কীভাবে এড়াবেন)

আপনি যদি কখনো **e-GP পোর্টালে (eprocure.gov.bd)** bid জমা দিয়ে দেখে থাকেন যে আপনার দরপত্র "non-responsive" হয়ে গেছে, তাহলে সেই হতাশা আপনার চেনা। দিনের পর দিন কাগজপত্র তৈরি করলেন, যত্ন করে দর হিসাব করলেন — তবু দাম বিবেচনার আগেই বাদ পড়ে গেলেন।

বেশিরভাগ ঠিকাদার দেরিতে যে কঠিন সত্যটা শেখেন তা হলো: **বেশিরভাগ দরপত্র হারে eligibility আর কাগজপত্রের ভুলে, দামে নয়।** একটা মাত্র অনুপস্থিত সনদ বা liquid asset-এর ঘাটতি একটা শক্তিশালী bid-কেও অযোগ্য করে দিতে পারে।

এই গাইডে **PPR 2025**-এর অধীনে দরপত্র non-responsive হওয়ার ১০টি সবচেয়ে সাধারণ কারণ এবং প্রতিটির সমাধান তুলে ধরা হলো।

---

### ১. Liquid Assets নির্ধারিত পরিমাণের কম
এটাই এক নম্বর নীরব ঘাতক। দরপত্রে একটা নির্দিষ্ট liquid asset চাওয়া হয় — যেমন ৬৫ লাখ টাকা। অনেক bidder তাদের gross পরিমাণ দেখিয়ে ধরে নেন তারা যোগ্য।

ভুলটা হলো: শর্তটা হলো **চলমান কাজের প্রতিশ্রুতি বাদ দিয়ে (net of commitments)**। আপনার ৫০ লাখ টাকা liquid asset থাকলেও যদি ১৫ লাখ ইতিমধ্যে চলমান কাজে আটকে থাকে, তাহলে আপনার *available* liquid asset মাত্র ৩৫ লাখ — এবং আপনি বাদ।

**সমাধান:** Bid করার আগে সবসময় *net available* liquid asset হিসাব করুন। সঠিক ফরম্যাটে (Form e-PW2A-8) মূল কপি নির্ধারিত সময়ের মধ্যে জমা দিন।

### ২. বাধ্যতামূলক কাগজপত্র অনুপস্থিত বা মেয়াদোত্তীর্ণ
ট্রেড লাইসেন্স, TIN সনদ, VAT/BIN নিবন্ধন, আয়কর রিটার্নের acknowledgement slip — এর কোনো একটি অনুপস্থিত, মেয়াদোত্তীর্ণ বা প্রয়োজনীয় অর্থবছর কভার না করলে, বাকি সব ঠিক থাকলেও bid non-responsive।

**সমাধান:** TDS-এ চাওয়া প্রতিটি কাগজের একটা checklist বানান এবং জমা দেওয়ার আগে প্রতিটির মেয়াদ যাচাই করুন।

### ৩. Key Personnel শর্ত পূরণ না হওয়া
দরপত্রে নির্দিষ্ট পদ থাকে — Project Manager, Site Engineer (Civil), Site Engineer (Electrical), Manager, Foreman ইত্যাদি — প্রতিটির ন্যূনতম শিক্ষাগত যোগ্যতা ও অভিজ্ঞতার বছর সহ। সাধারণ ভুল হলো Project Manager থাকলেও প্রয়োজনীয় Electrical Site Engineer বা Night Guard না থাকা।

**সমাধান:** প্রতিটি প্রয়োজনীয় পদ আপনার আসল জনবলের সাথে মিলিয়ে নিন, CV ও অভিজ্ঞতার বছর সহ (e-PW2A-5 ফরমে)। কোনো পদ অন্য চলমান কাজে নিযুক্ত থাকলে সেটা available হিসেবে গণ্য হবে না।

### ৪. Equipment Capacity-র ঘাটতি
Works দরপত্রে নির্দিষ্ট সরঞ্জাম লাগে — concrete mixer, vibrator, levelling machine, compaction machine, re-bar cutting ও welding machine। একটা ধরনও অনুপস্থিত থাকলে, বা ownership/hire সনদ না থাকলে bid non-responsive।

**সমাধান:** আপনার সরঞ্জামের তালিকা (owned, hired বা leased) শর্তের সাথে মিলিয়ে নিন এবং সহায়ক ownership বা hire চুক্তি প্রস্তুত রাখুন।

### ৫. Similar Work Experience-এর মূল্য কম
দরপত্রে সাম্প্রতিক বছরগুলোতে সম্পন্ন একই ধরনের কাজ চাওয়া হয়, প্রতিটি একটা ন্যূনতম মূল্যের উপরে — work completion certificate দিয়ে সমর্থিত (শুধু work order নয়)।

**সমাধান:** আপনার completion certificate গুলো গুছিয়ে রাখুন এবং নিশ্চিত করুন অন্তত একটা প্রয়োজনীয় মূল্য ও ধরনের সাথে মেলে।

### ৬. Tender Capacity সীমার নিচে
Tender Capacity একটা formula দিয়ে হিসাব হয় (A×N×1.25 − B), যেখানে B হলো আপনার চলমান প্রতিশ্রুতির মূল্য। Bidder-রা প্রায়ই B বাদ দিতে ভুলে যান, ফলে capacity বেশি দেখায়।

**সমাধান:** সৎভাবে হিসাব করুন। এই formula নিয়ে আমরা আলাদা একটা গাইডে বিস্তারিত আলোচনা করেছি।

### ৭. Tender Security সংক্রান্ত সমস্যা
ভুল পরিমাণ, ভুল ফরম্যাট, বা e-Tender security-র মেয়াদ শেষ — যেকোনোটাই তাৎক্ষণিকভাবে bid বাতিল করতে পারে।

**সমাধান:** IFT-তে উল্লেখিত সঠিক পরিমাণ ও মেয়াদ অনুসরণ করুন।

### ৮. Bid Validity Period খুব কম
আপনার দরপত্র যদি TDS-এর চাওয়া সময়ের (যেমন ১২০ দিন) চেয়ে কম মেয়াদের হয়, তাহলে স্বয়ংক্রিয়ভাবে non-responsive।

**সমাধান:** Validity period হুবহু মিলিয়ে দিন।

### ৯. Significantly Low-Priced Tender (SLT) — PPR 2025-এ নতুন
PPR 2025 একটা formula-ভিত্তিক SLT সিস্টেম চালু করেছে। আপনার দাম যদি বাজার ও official estimate-এর তুলনায় অস্বাভাবিক কম হিসেবে চিহ্নিত হয়, তাহলে non-responsive হতে পারে।

**সমাধান:** বাস্তবসম্মত দাম দিন। অস্বাভাবিক কম bid এখন আর নিশ্চিত জয় নয় — এটা এখন একটা ঝুঁকি।

### ১০. Pre-Bid Meeting-এর Clarification না পড়া
অনেক শর্ত pre-bid meeting-এ পরিষ্কার করা হয়। সেটা এড়িয়ে গেলে আপনি একটা অস্পষ্ট শর্ত ভুল বুঝতে পারেন।

**সমাধান:** সবসময় pre-bid clarification পড়ুন বা অংশ নিন — procuring entity-র ব্যাখ্যা অনুমানের চেয়ে বড়।

---

### বুদ্ধিমানের পথ: Bid করার আগে যাচাই করুন

প্রতিটা দরপত্রের জন্য এই ১০টা পয়েন্ট হাতে হাতে যাচাই করতে একটা দীর্ঘ Standard Tender Document (STD) সাবধানে পড়তে ঘণ্টার পর ঘণ্টা লাগে। আর একটা মিস হলেই bid হারাতে পারেন।

**eGPTenderHub ঠিক এই কাজটাই আপনার জন্য করে।** দরপত্রের notice upload করুন, আমাদের AI এই প্রতিটি শর্ত আপনার company profile-এর সাথে যাচাই করে — liquid assets (net of commitments), personnel, equipment, কাগজপত্র, এবং capacity — তারপর তাৎক্ষণিকভাবে বলে দেয় আপনি যোগ্য কিনা, আর কী missing।

**আর অনুমান নয়। egptenderhub.com-এ মিনিটেই আপনার eligibility যাচাই করুন — এমন একটা bid-এ দিন নষ্ট করার আগে যেটা আপনি জিততে পারবেন না।**
      `,
    },
    {
      title: lang === 'bn' ? 'ই-জিপি রেজিস্ট্রেশন ও প্রোফাইল আপডেট গাইড (২০২৫)' : 'Step-by-Step Guide to e-GP Registration & Profile Update in Bangladesh (2025)',
      excerpt: lang === 'bn' ? 'নতুন ঠিকাদারদের জন্য ই-জিপি পোর্টালে সাইন আপ এবং প্রয়োজনীয় কাগজপত্র আপডেট করার সহজ নির্দেশিকা।' : 'A simple guide on how new contractors can sign up for e-GP and map their mandatory documents successfully.',
      date: 'Oct 20, 2025',
      category: 'Guide',
      contentEn: `
## E-GP Registration & Profile Update in Bangladesh (2025)

The National e-Government Procurement (e-GP) portal has completely digitized how public infrastructure and supply contracts are managed in Bangladesh. Whether you are a newly enlisted *Tekadar* (contractor) or an established firm looking to bid on massive PWD projects, having a verified and highly optimized e-GP profile is your first ticket to success.

However, the **e-GP registration in Bangladesh** can feel overwhelming due to the strict document verification process. A single misaligned document can lock you out of bidding for weeks.

In this guide, we break down the exact steps to register, update your profile, and start bidding in 2025 without the headaches.

---

### Step 1: Prepare Your Mandatory Legal Documents
Before you even click "Register" on the e-GP portal, you must have high-quality, scanned PDFs of your company's core documents. The verification desk will reject your application if anything is blurry or expired.

Gather the following:
1.  **Up-to-date Trade License:** Ensure it is renewed for the current fiscal year.
2.  **TIN Certificate & Income Tax Clearance:** You must show proof of recent tax returns.
3.  **VAT/BIN Registration Certificate.**
4.  **Enlistment Certificates:** If you are enlisting under specific departments (PWD, RHD, LGED), have those licenses ready.
5.  **Bank Solvency Certificate:** A recent statement proving your company's financial health.
6.  **NID & Passport Size Photos:** For the Managing Director or authorized personnel.
7.  **(Optional but Recommended):** Incorporation certificate (if a limited company) and registered Partnership Deed (if applicable).

### Step 2: Create Your e-GP User Account
1.  Navigate to the official e-GP portal (eprocure.gov.bd).
2.  Click on the **"New User Registration"** tab.
3.  Fill out the preliminary form with your email address and a highly secure password.
4.  You will receive an OTP and a verification link to your email. Click it to activate your basic login profile.

> *Pro-Tip: Do not use a personal email address. Always use a professional company email (e.g., info@yourcompany.com) to establish trust with evaluating committees.*

### Step 3: Complete the Profile & Document Mapping
This is the most critical phase. An incomplete **e-GP profile update** is the #1 reason contractors are deemed non-responsive.

1.  Log into your new e-GP dashboard.
2.  Go to the **"Mapper"** or **"Document"** section.
3.  Upload the PDFs you prepared in Step 1.
4.  **Important:** You must accurately enter the Issue Date, Expiry Date, and Reference Number for *every single document*. If a trade license expires next month, you must remember to update it in the e-GP system before bidding on any new tender.

### Step 4: Pay the Registration Fee
To finalize your profile, you need to pay the non-refundable registration fee.

1.  Generate a payment slip from the dashboard.
2.  Take this slip to any enlisted scheduled bank handling e-GP payments.
3.  Once the bank processes the payment, your e-GP status will change to "Pending Verification."
4.  Wait 2 to 5 working days. The e-GP helpdesk manually verifies your uploaded documents. If everything matches, your profile will become "Active".

### Step 5: Updating Your Experience & Liquid Assets
Simply having a registered profile is not enough to win OTM or LTM tenders. You need to prove you have the capacity to do the work.

Inside your dashboard, regularly update your:
*   **Similar Work Experience:** Upload Completion Certificates mapped meticulously to the correct procurement categories.
*   **Average Annual Turnover:** Upload your audited financial reports.
*   **Liquid Assets:** Track your active credit lines to ensure you meet the minimum financial criteria of the tenders you are eyeing.

---

### You Are Registered. What Now?
Once your profile is approved, staring at hundreds of complex tender notices every morning can be exhausting. It takes hours to read a single Standard Tender Document (STD) to figure out if your newly approved profile actually meets the required liquid assets or similar work experience.

**This is where eGPTenderHub changes the game.**

Instead of reading a 500-page PDF manually, simply upload the tender notice to **eGPTenderHub**. Our AI instantly scans the document, compares the requirements against your company profile, and tells you immediately if you are eligible to bid—saving you hours of frustration and preventing costly rejections.

**Once your e-GP profile is approved, use eGPTenderHub to find out exactly which tenders you qualify for in seconds.**
      `,
      contentBn: `
## ই-জিপি রেজিস্ট্রেশন ও প্রোফাইল আপডেট গাইড (২০২৫)

ন্যাশনাল ই-গভর্নমেন্ট প্রকিউরমেন্ট (e-GP) পোর্টাল বাংলাদেশের সরকারি অবকাঠামো এবং সরবরাহ চুক্তির ব্যবস্থাপনাকে সম্পূর্ণ ডিজিটাল করে তুলেছে। আপনি নতুন তালিকাভুক্ত ঠিকাদার হোন বা বড় প্রোজেক্টে বিড করতে চাওয়া প্রতিষ্ঠিত প্রতিষ্ঠান, যাচাইকৃত এবং অপ্টিমাইজড ই-জিপি প্রোফাইল থাকা আপনার সফলতার প্রথম সিঁড়ি।

তবে, নথিপত্র যাচাইয়ের কঠোর প্রক্রিয়ার কারণে **ই-জিপি রেজিস্ট্রেশন** অনেক সময় জটিল মনে হতে পারে। একটি ভুল নথির কারণে আপনি সপ্তাহখানেকের জন্য বিডিং থেকে বাদ পড়তে পারেন।

এই গাইডে, আমরা ২০২৫ সালে কোনো ঝামেলা ছাড়াই রেজিস্ট্রেশন, প্রোফাইল আপডেট এবং বিডিং শুরু করার সঠিক ধাপগুলো ভেঙে আলোচনা করেছি।

---

### ধাপ ১: বাধ্যতামূলক আইনি কাগজপত্র প্রস্তুত করুন
ই-জিপি পোর্টালে "রেজিস্টার" এ ক্লিক করার আগেই, আপনার কোম্পানির প্রয়োজনীয় কাগজপত্রগুলোর উচ্চমানের স্ক্যান করা পিডিএফ থাকতে হবে। অস্পষ্ট বা মেয়াদোত্তীর্ণ কোনো কাগজ থাকলে যাচাইকরণ ডেস্ক আপনার আবেদন বাতিল করবে।

নিচের কাগজপত্রগুলো সংগ্রহ করুন:
১. **আপডেট করা ট্রেড লাইসেন্স:** নিশ্চিত করুন যে এটি চলতি অর্থবছরের জন্য নবায়ন করা হয়েছে।
২. **TIN পেপার এবং আয়কর ছাড়পত্র:** আপনাকে সাম্প্রতিক ট্যাক্স রিটার্নের প্রমাণ দেখাতে হবে।
৩. **VAT/BIN নিবন্ধন সনদ।**
৪. **তালিকাভুক্তির সনদ:** যদি আপনি নির্দিষ্ট বিভাগের অধীনে (PWD, RHD, LGED) তালিকাভুক্ত হন, তবে সেই লাইসেন্সগুলো প্রস্তুত রাখুন।
৫. **ব্যাংক সচ্ছলতা সনদ (Solvency Certificate):** আপনার কোম্পানির আর্থিক স্বচ্ছলতা প্রমাণের জন্য সাম্প্রতিক একটি ব্যাংক স্টেটমেন্ট।
৬. **NID এবং পাসপোর্ট সাইজের ছবি:** ব্যবস্থাপনা পরিচালক বা অনুমোদিত ব্যক্তির জন্য।
৭. **(ঐচ্ছিক কিন্তু প্রস্তাবিত):** ইনকর্পোরেশন সার্টিফিকেট (লিমিটেড কোম্পানি হলে) এবং নিবন্ধিত পার্টনারশিপ ডিড (প্রযোজ্য ক্ষেত্রে)।

### ধাপ ২: আপনার ই-জিপি ইউজার অ্যাকাউন্ট তৈরি করুন
১. অফিসিয়াল ই-জিপি পোর্টালে (eprocure.gov.bd) যান।
২. **"New User Registration"** ট্যাবে ক্লিক করুন।
৩. আপনার ইমেইল এবং একটি শক্তিশালী পাসওয়ার্ড দিয়ে প্রাথমিক ফর্মটি পূরণ করুন।
৪. আপনি একটি OTP এবং ভেরিফিকেশন লিঙ্ক সহ ইমেইল পাবেন। প্রাথমিক লগইন প্রোফাইল সক্রিয় করতে সেটিতে ক্লিক করুন।

> *সতর্কতা: ব্যক্তিগত ইমেইল ব্যবহার করবেন না। মূল্যায়ন কমিটির কাছে বিশ্বাসযোগ্যতা বাড়াতে সবসময় পেশাদার কোম্পানির ইমেইল (যেমন: info@yourcompany.com) ব্যবহার করুন।*

### ধাপ ৩: প্রোফাইল এবং ডকুমেন্ট ম্যাপিং সম্পন্ন করা
এটি সবচেয়ে গুরুত্বপূর্ণ ধাপ। অসম্পূর্ণ **ই-জিপি প্রোফাইল আপডেট** ঠিকাদারদের অযোগ্য হওয়ার ১ নম্বর কারণ।

১. নতুন ই-জিপি ড্যাশবোর্ডে লগইন করুন।
২. **"Mapper"** বা **"Document"** সেকশনে যান।
৩. প্রথম ধাপে প্রস্তুত করা পিডিএফগুলো আপলোড করুন।
৪. **জরুরি:** আপনাকে *প্রতিটি নথির* জন্য ইস্যু করার তারিখ, মেয়াদোত্তীর্ণের তারিখ এবং রেফারেন্স নম্বর নির্ভুলভাবে দিতে হবে। যদি ট্রেড লাইসেন্সের মেয়াদ আগামী মাসে শেষ হয়, তবে নতুন টেন্ডারে বিড করার আগেই সেটি ই-জিপি সিস্টেমে আপডেট করতে ভুলবেন না।

### ধাপ ৪: ফি প্রদান
প্রোফাইল চূড়ান্ত করতে আপনাকে অফেরতযোগ্য নিবন্ধন ফি দিতে হবে।

১. ড্যাশবোর্ড থেকে একটি পেমেন্ট স্লিপ তৈরি করুন।
২. স্লিপটি ই-জিপি পেমেন্ট গ্রহণকারী যেকোনো তালিকাভুক্ত তফসিলি ব্যাংকে জমা দিন।
৩. ব্যাংক পেমেন্ট প্রসেস করার পর আপনার ই-জিপি স্ট্যাটাস "Pending Verification" এ পরিবর্তিত হবে।
৪. ২ থেকে ৫ কার্যদিবস অপেক্ষা করুন। হেল্পডেস্ক ম্যানুয়ালি আপনার নথিগুলো যাচাই করবে। সবকিছু ঠিক থাকলে প্রোফাইল "Active" হয়ে যাবে।

### ধাপ ৫: কাজের অভিজ্ঞতা এবং তরল সম্পদ (Liquid Assets) আপডেট করা
শুধুমাত্র নিবন্ধিত প্রোফাইল থাকলেই OTM বা LTM টেন্ডার পাওয়া যায় না। আপনাকে কাজের সক্ষমতা প্রমাণ করতে হবে।

ড্যাশবোর্ডে নিয়মিত এগুলো আপডেট করুন:
* **পূর্ব কাজের অভিজ্ঞতা:** প্রকিউরমেন্ট ক্যাটাগরি অনুযায়ী সফলভাবে সম্পন্ন হওয়া কাজের কমপ্লিশন সার্টিফিকেট (Completion Certificate) আপলোড করুন।
* **গড় বার্ষিক লেনদেন (Average Annual Turnover):** আপনার অডিট করা ফাইন্যান্সিয়াল রিপোর্ট আপলোড করুন।
* **তরল সম্পদ (Liquid Assets):** আপনি যে টেন্ডারে বিড করতে চান, তার ন্যূনতম আর্থিক মানদণ্ড পূরণে ক্রেডিট লাইন ট্র্যাক করুন।

---

### আপনার রেজিস্ট্রেশন সম্পন্ন হয়েছে। এরপর কী?
প্রোফাইল অনুমোদিত হওয়ার পর, প্রতিদিন সকালে শত শত জটিল টেন্ডার নোটিশ পড়া ক্লান্তিকর হতে পারে। সদ্য অনুমোদিত প্রোফাইলটি প্রয়োজনীয় তরল সম্পদ বা কাজের অভিজ্ঞতার শর্ত পূরণ করে কি না, তা বুঝতে একটি স্ট্যান্ডার্ড টেন্ডার ডকুমেন্ট (STD) ম্যানুয়ালি পড়তে প্রচুর সময় লাগে।

**আর এখানেই eGPTenderHub আপনার কাজ সহজ করে দেয়।**

৫০০-পৃষ্ঠার পিডিএফ ম্যানুয়ালি না পড়ে, সরাসরি **eGPTenderHub** তে টেন্ডার নোটিশ আপলোড করুন। আমাদের আর্টিফিশিয়াল ইন্টেলিজেন্স তাৎক্ষণিকভাবে নোটিশটি স্ক্যান করে আপনার প্রোফাইলের সাথে শর্তগুলো মিলিয়ে দেখবে এবং আপনি বিড করার যোগ্য কি না তা সাথে সাথে বলে দেবে—যা আপনার সময় বাঁচাবে এবং অযোগ্য হওয়ার ঝুঁকি এড়াতে সাহায্য করবে।
      `,
    },
    {
      title: lang === 'bn' ? 'পিপিআর ২০২৫-এ নতুন কী আছে?' : 'What is new in the PPR 2025 guidelines?',
      excerpt: lang === 'bn' ? 'বাংলাদেশ সরকারি ক্রয় বিধিমালার সর্বশেষ সংশোধনী এবং ঠিকাদারদের জন্য এর প্রভাব নিয়ে বিস্তারিত আলোচনা।' : 'A detailed breakdown of the latest amendments to the Bangladesh Public Procurement Rules and what it means for contractors.',
      date: 'Oct 15, 2025',
      category: 'Compliance',
      contentEn: `
## Navigating the PPR 2025 Updates

The Bangladesh Public Procurement Rules (PPR) have undergone significant revisions for the 2025 fiscal year. These changes are designed to streamline the e-GP system, enhance transparency, and ensure fairer competition among contractors.

### 1. Stricter Liquid Asset Requirements
Previously, many contractors struggled with the verification of bank credit lines. Under the new rules, the mechanism for submitting **Credit Line Certificates** has been digitally integrated with the Bangladesh Bank database. This means:
* No more manual verification delays.
* Instant disqualification for forged documents.
* A clear mandate to maintain healthy working capital throughout the project lifecycle.

### 2. Enhanced Tender Capacity Calculations
The formula for Tender Capacity (TC) has been modified. The new equation places a heavier weight on recent, successfully completed projects.
> *Pro-Tip: Always update your e-GP profile immediately after receiving a completion certificate to reflect your maximized tender capacity.*

### 3. AI and Automated Evaluations
The evaluation committees are now equipped with preliminary AI-driven screening tools. These tools cross-reference your past technical specifications and completion history automatically.

**Conclusion:** Staying compliant in 2025 means fully embracing the digitized, interconnected nature of the new e-GP ecosystem. Ensure your financial documents are impeccable and your project completion records are instantly digitized.
      `,
      contentBn: `
## পিপিআর ২০২৫ আপডেটের নির্দেশিকা

বাংলাদেশ সরকারি ক্রয় বিধিমালা (PPR) ২০২৫ অর্থবছরের জন্য উল্লেখযোগ্যভাবে সংশোধন করা হয়েছে। এই পরিবর্তনগুলোর মূল উদ্দেশ্য হল ই-জিপি সিস্টেমকে আরও সহজতর করা, স্বচ্ছতা বৃদ্ধি করা এবং ঠিকাদারদের মধ্যে প্রতিযোগিতার সমতা নিশ্চিত করা।

### ১. তরল সম্পদের কঠোর নিয়মাবলি
আগে ব্যাংক ক্রেডিট লাইন যাচাই করতে অনেক সময় লাগত। নতুন নিয়মে, **ক্রেডিট লাইন সার্টিফিকেট** জমা দেওয়ার প্রক্রিয়াটি বাংলাদেশ ব্যাংকের ডেটাবেসের সাথে ডিজিটালি যুক্ত করা হয়েছে। এর মানে:
* ম্যানুয়াল যাচাইকরণে আর কোনো বিলম্ব নেই।
* জাল নথিপত্রের জন্য তাৎক্ষণিক অযোগ্যতা।
* প্রকল্প চলাকালীন পর্যাপ্ত চলতি মূলধন বজায় রাখার কঠোর নির্দেশ।

### ২. টেন্ডার ক্যাপাসিটি হিসাবের পরিবর্তন
টেন্ডার ক্যাপাসিটি (TC) এর সূত্র পরিবর্তন করা হয়েছে। নতুন সমীকরণে সম্প্রতি সফলভাবে শেষ হওয়া প্রকল্পগুলোকে বেশি গুরুত্ব দেওয়া হচ্ছে।

### ৩. স্বয়ংক্রিয় মূল্যায়ন
মূল্যায়ন কমিটিগুলো এখন কৃত্রিম বুদ্ধিমত্তা (AI) চালিত প্রাথমিক স্ক্যানিং টুল ব্যবহার করছে।

**উপসংহার:** ২০২৫ সালে কাজ পেতে হলে আপনাকে নতুন ই-জিপি ইকোসিস্টেমের ডিজিটাল প্রযুক্তির সাথে পুরোপুরি মানিয়ে নিতে হবে।
      `,
    },
    {
      title: lang === 'bn' ? 'কিভাবে তরল সম্পদের হিসাব করবেন' : 'How to accurately calculate Liquid Assets for e-GP',
      excerpt: lang === 'bn' ? 'ই-জিপি দরপত্রে অংশগ্রহণের জন্য ব্যাংক ক্রেডিট লাইন এবং তরল সম্পদের সঠিক হিসাব করার পদ্ধতি।' : 'Understanding Credit Lines and working capital requirements for major infrastructure tenders in the e-GP system.',
      date: 'Oct 02, 2025',
      category: 'Financial',
      contentEn: `
## The Importance of Liquid Assets

When bidding for major infrastructure projects, proving you have the financial stamina is just as important as your technical capacity. The e-GP system demands a very specific calculation for Liquid Assets (LA).

### What Counts as a Liquid Asset?
1. Cash at bank (Current/Savings Accounts)
2. Fixed Deposits (FDR) free from lien
3. Confirmed Credit Line Certificates from scheduled banks

### The Pitfalls to Avoid
Many contractors fail the evaluation stage simply because their bank certificates are improperly formatted or issued after the tender publication date.

**Golden Rule:** Always request your bank to issue the Credit Line Certificate *strictly* in the exact format provided in the tender document (usually Form PW3-7). Any deviation in wording can lead to immediate rejection by the Tender Evaluation Committee (TEC).
      `,
      contentBn: `
## তরল সম্পদের গুরুত্ব

বড় অবকাঠামো প্রকল্পে দরপত্রের জন্য, আপনার আর্থিক সক্ষমতা প্রমাণ করা অত্যন্ত গুরুত্বপূর্ণ। ই-জিপি সিস্টেমে লিকুইড অ্যাসেট (LA) এর জন্য একটি খুব নির্দিষ্ট হিসাব প্রয়োজন।

### তরল সম্পদ হিসাবে কী গণ্য হয়?
১. ব্যাংকে থাকা নগদ অর্থ (চলতি/সঞ্চয়ী হিসাব)
২. লিয়েনমুক্ত ফিক্সড ডিপোজিট (FDR)
৩. তফসিলি ব্যাংক থেকে নিশ্চিত ক্রেডিট লাইন সার্টিফিকেট

**সুবর্ণ নিয়ম:** সর্বদা আপনার ব্যাংককে টেন্ডার ডকুমেন্টে দেওয়া সঠিক ফরমেটে ক্রেডিট লাইন সার্টিফিকেট ইস্যু করার জন্য অনুরোধ করুন।
      `,
    },
    {
      title: lang === 'bn' ? 'সর্বোচ্চ দরদাতা হওয়ার গোপন কৌশল' : 'Winning Strategies for LTM and OTM Tenders',
      excerpt: lang === 'bn' ? 'কীভাবে এআই ব্যবহার করে অন্যান্য প্রতিযোগী থেকে এগিয়ে থাকবেন এবং দরপত্র জেতার সম্ভাবনা বাড়াবেন।' : 'How to leverage AI to identify hidden clauses before your competitors and increase your win rate.',
      date: 'Sep 28, 2025',
      category: 'Strategy',
      contentEn: `
## Winning OTM and LTM Tenders

Open Tendering Method (OTM) and Limited Tendering Method (LTM) have distinct competitive landscapes. Knowing how to navigate them is key to growing your portfolio.

### 1. Pre-Tender Analysis
Don't just jump into pricing. First, deeply analyze the **Section 3: General Conditions of Contract (GCC)** and **Section 4: Particular Conditions of Contract (PCC)**. Often, penalties or hidden insurance requirements reside here.

### 2. Leveraging eGPTenderHub AI
By running the tender notice through eGPTenderHub's AI Analysis engine, you can instantly extract:
- Specific past experience requirements.
- Exact equipment ownership needs.
- Accurate liquid asset benchmarks.

This saves hours of manual reading and prevents critical oversights.
      `,
      contentBn: `
## OTM এবং LTM দরপত্র জেতার কৌশল

উন্মুক্ত দরপত্র পদ্ধতি (OTM) এবং সীমিত দরপত্র পদ্ধতি (LTM) এর প্রতিযোগিতামূলক ক্ষেত্র ভিন্ন।

### ১. দরপত্র পূর্ব বিশ্লেষণ
শুধুমাত্র দাম নির্ধারণে ঝাঁপিয়ে পড়বেন না। প্রথমে চুক্তির সাধারণ শর্তাবলি (GCC) এবং চুক্তির বিশেষ শর্তাবলি (PCC) গভীরভাবে বিশ্লেষণ করুন।

### ২. এআই ব্যবহার করা
eGPTenderHub এর এআই বিশ্লেষণ ইঞ্জিন ব্যবহার করে, আপনি তাৎক্ষণিকভাবে মূল তথ্যগুলো বের করতে পারেন, যা আপনাকে অন্যান্য প্রতিযোগীদের থেকে এগিয়ে রাখবে।
      `,
    },
  ];

  if (activePostIdx !== null) {
    const activePost = posts[activePostIdx];
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="max-w-3xl mx-auto py-12 px-4 space-y-8"
      >
        <button
          onClick={() => setActivePostIdx(null)}
          className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors group px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg w-auto hover:bg-slate-200 dark:hover:bg-slate-700"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          {lang === 'bn' ? 'ফিরে যান' : 'Back to Articles'}
        </button>

        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-4 text-sm font-semibold text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full">
              <Tag className="w-4 h-4" />
              {activePost.category}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {activePost.date}
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            {activePost.title}
          </h1>

          <div className="w-full h-px bg-slate-200 dark:bg-slate-800 my-8"></div>

          <div className="prose prose-slate dark:prose-invert max-w-none text-slate-700 dark:text-slate-300">
            <style>{`
              .prose h2 { color: var(--tw-prose-headings); font-size: 1.5rem; font-weight: 800; margin-top: 2em; margin-bottom: 1em; }
              .prose h3 { color: var(--tw-prose-headings); font-size: 1.25rem; font-weight: 700; margin-top: 1.5em; margin-bottom: 0.5em; }
              .prose p { margin-top: 1.25em; margin-bottom: 1.25em; line-height: 1.75; }
              .prose ul { margin-top: 1.25em; margin-bottom: 1.25em; padding-left: 1.625em; list-style-type: disc; }
              .prose li { margin-top: 0.5em; margin-bottom: 0.5em; }
              .prose strong { color: var(--tw-prose-bold); font-weight: 700; }
              .prose blockquote { border-left-width: 4px; border-left-color: #3b82f6; padding-left: 1rem; font-style: italic; color: #64748b; background-color: #f8fafc; padding: 1rem; border-radius: 0.5rem; margin-top: 1.5rem; margin-bottom: 1.5rem; }
              .dark .prose blockquote { background-color: #1e293b; color: #94a3b8; border-left-color: #60a5fa; }
              .dark .prose h2, .dark .prose h3 { color: #f8fafc; }
              .dark .prose strong { color: #f8fafc; }
            `}</style>
            <div className="markdown-body">
              <ReactMarkdown>{lang === 'bn' ? activePost.contentBn : activePost.contentEn}</ReactMarkdown>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-12 py-12 px-4 shadow-[0_0_0_1px_transparent]"
    >
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-semibold mb-4 border border-blue-100 dark:border-blue-800">
          <Newspaper className="w-4 h-4" />
          <span>News & Insights</span>
        </div>
        <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {lang === 'bn' ? 'উন্নয়ন ও দরপত্র বিষয়ক ব্লগ' : 'eGPTenderHub Insights'}
        </h2>
        <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          {lang === 'bn'
            ? 'পিপিআর আপডেট, ই-জিপি টিপস এবং ঠিকাদারি ব্যবসার প্রসারের জন্য প্রবন্ধ।'
            : 'Stay updated with the latest in Bangladesh procurement rules, e-GP strategies, and AI innovations.'}
        </p>
      </div>

      <div className="space-y-6">
        {posts.map((post, idx) => (
          <div
            key={idx}
            onClick={() => setActivePostIdx(idx)}
            className="group flex flex-col md:flex-row gap-6 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all cursor-pointer"
          >
            <div className="w-full md:w-1/4 aspect-video md:aspect-auto bg-slate-100 dark:bg-slate-800 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden transition-colors group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20">
                <Newspaper className="w-10 h-10 text-slate-400 dark:text-slate-500 group-hover:text-blue-500 transition-colors mb-2" />
                <span className="text-xs font-bold text-slate-400 group-hover:text-blue-500 transition-colors uppercase tracking-wider">{post.category}</span>
            </div>
            <div className="w-full md:w-3/4 flex flex-col justify-center space-y-3">
              <div className="flex items-center gap-4 text-xs font-semibold tracking-wider text-slate-500">
                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5"/> {post.date}</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {post.title}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                {post.excerpt}
              </p>
              <div className="pt-2 flex items-center gap-2 text-sm font-bold text-blue-600 dark:text-blue-400">
                {lang === 'bn' ? 'বিস্তারিত পড়ুন' : 'Read Article'} <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center pt-8">
         <button className="px-6 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-xl font-bold transition-colors shadow-sm">
            {lang === 'bn' ? 'আরও দেখুন' : 'Load More Posts'}
         </button>
      </div>
    </motion.div>
  );
};
