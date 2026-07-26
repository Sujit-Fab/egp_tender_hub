export const getBlogPosts = (lang: 'en' | 'bn') => [
          {
             slug: 'slt-significantly-low-priced-tender-ppr-2025',
            title: lang === 'bn' ? 'SLT (উল্লেখযোগ্যরূপে নিম্নমূল্যের দরপত্র) — PPR 2025 তফসিল-১৮-এর পূর্ণ সূত্র ও উদাহরণ' : 'SLT (Significantly Low-priced Tender) — The Full PPR 2025 Formula, With a Worked Example',
      excerpt: lang === 'bn' ? 'PPR 2025-এর তফসিল-১৮ SLT নির্ণয়ের সঠিক সূত্র দিয়েছে — ভারযুক্ত গড় (০.৫০/০.৩০/০.২০), ওয়েটেড স্ট্যান্ডার্ড ডেভিয়েশন, আর নিম্নসীমা। গেজেটের নিজস্ব উদাহরণসহ ব্যাখ্যা।' : 'PPR 2025 Schedule-18 sets out the exact SLT calculation — weighted average (0.50/0.30/0.20), weighted standard deviation, and the cut-off. Explained with the Gazette\'s own worked example.',
      date: 'Jul 16, 2026',
      category: 'Compliance',
      contentEn: `
## SLT Under PPR 2025: The Exact Formula That Decides If Your Low Bid Survives

Under PPR 2025, submitting the lowest price no longer means winning. A formula now decides whether your price is credible — and if it falls below a calculated cut-off, your tender is rejected as a **Significantly Low-priced Tender (SLT)**.

This guide sets out the actual calculation as published in **Schedule-18 of PPR 2025 (framed under Rule 118(25) and (26))**, gazetted on 28 September 2025.

---

### What Schedule-18 Defines as an SLT

An SLT is a tender where the price and its components are so low — measured against the official cost estimate, recent market price indices, and the prices of other acceptable bidders — that the procuring entity has serious concern the bidder cannot perform the contract at that price.

The Schedule is explicit about why this matters. A very low bid may look attractive on paper, but in practice it can lead to cost escalation, low-quality output, delays, and even contract termination. Some bidders quote unrealistically low simply to win, then cannot finish — leaving the procuring entity to manage a non-performing contractor or start over, costing more time and money.

---

### Where SLT Applies

Schedule-18 is headed as the process for **identification and evaluation of significantly low-priced tenders by the Tender Evaluation Committee in domestic (national) procurement**. That heading is your scope indicator: the mechanism sits with the TEC and is framed for domestic procurement.

One related detail appears in paragraph 6. When the national price index is computed, procurement processes conducted under the **limited tendering method in domestic procurement are excluded** from that index calculation.

Beyond this, do not assume. If your tender document is silent on how a low price will be treated, that is precisely the question to raise at the pre-bid meeting.

---

### When the Index Figure Becomes Available

Paragraph 6 and the Gazette's example together give the timing. The index is computed for the tender opening day plus the preceding 27 days, and the **e-GP portal publishes the figure shortly after midnight following the opening day**.

The practical consequence is unavoidable: the index that will be applied to your tender is not published until after you have already submitted and the tender has opened. You cannot price against it. You can only price against your own costs.

---

### Step 1: The 10% Upper Filter (Applied First)

Before any averaging happens, Schedule-18 paragraph 7 applies a filter to prevent distortion:

> Any tender priced **more than 10% above the official cost estimate** is excluded from both formulas — and is itself treated as non-responsive.

This matters in two directions. A very high bid cannot be used to inflate the average and drag the cut-off upward. And if you bid more than 10% above the estimate, you are out at preliminary evaluation regardless of everything else.

---

### Step 2: The Weighted Average (x̄)

The weighted average is calculated from three inputs:

**x̄ = 0.5 × (Σxᵢ / n) + 0.2 × x_OCE + 0.3 × x_NPPI**

Where:

- **xᵢ** = the price quoted by each technically acceptable (responsive) tenderer
- **n** = the number of acceptable tenders
- **x_OCE** = the official cost estimate for the package
- **x_NPPI** = the price derived from the recent public procurement price index on the e-GP portal

The weights are fixed by the Schedule:

| Component | Weight |
|---|---|
| Average price of acceptable tenderers | **0.50** |
| Price index (NPPI) based figure | **0.30** |
| Official cost estimate (OCE) | **0.20** |

Note the balance: half the weight rests on what your competitors actually bid. The other half is anchored to the official estimate and current market movement.

---

### How x_NPPI Is Determined

The index is calculated per procurement category (goods, works, or physical services). For a given tender, it uses the **tender opening day plus the preceding 27 days — 28 days in total**.

Across that window, the system takes all procurement processes in that category where a notification of award was issued (excluding limited tendering method cases in domestic procurement), and computes the national average percentage deviation between the official cost estimate and the awarded price.

That national average deviation is then applied to your tender's official estimate to produce x_NPPI. In practice, if recent awards in your category have been settling around 8.32% below estimate, the index factor is 0.9168.

---

### Step 3: The Weighted Standard Deviation (Sd)

**Sd = √{ Σ(xᵢ − x̄)² / n }**

Where xᵢ is each tenderer's quoted price, x̄ is the weighted average from Step 2, and n is the number of acceptable tenders.

---

### Step 4: The Cut-off

**Lower limit of acceptable price = x̄ − Sd**

Any tender priced **below this line** is classified as a Significantly Low-priced Tender and is **cancelled**. Evaluation then proceeds among the tenders above the line.

---

### The Gazette's Own Worked Example

Schedule-18 includes a full example. It is worth following closely, because it shows how quickly a competitive-looking bid can fall out.

**The setup:** A procuring entity invites tenders for works with an official estimate of **Tk. 4,00,00,000**. Tender invited 20 August; submission and opening on 15 September. Seven bidders submit.

**The index:** For 15 September and the preceding 27 days, the NPPI works out to 8.32% below estimate — a factor of **0.9168**.

**Preliminary and technical screening:**

| Bidder | Price (Tk.) | Status |
|---|---|---|
| ক | 3,40,57,525 | Acceptable |
| খ | 3,65,37,500 | Acceptable |
| গ | 3,82,58,655 | Acceptable |
| ঘ | 4,11,45,689 | Acceptable |
| ঙ | 4,48,76,900 | **Rejected — more than 10% above estimate** |
| চ | 3,60,04,268 | Not acceptable |
| ছ | 3,77,89,320 | Acceptable |

Five bidders remain. Note that ঙ, at roughly 12% above the estimate, is knocked out by the 10% filter before any averaging.

**The calculation:**

- Average of the five acceptable prices = **Tk. 3,75,56,937.80**
- x_OCE = Tk. 4,00,00,000
- x_NPPI = 4,00,00,000 × 0.9168 = **Tk. 3,66,72,000**

Weighted average:
x̄ = 0.5 × 3,75,56,937.80 + 0.3 × 3,66,72,000 + 0.2 × 4,00,00,000
**x̄ ≈ Tk. 3,77,80,068.90**

Weighted standard deviation:
**Sd ≈ Tk. 23,21,810.79**

Cut-off:
3,77,80,068.90 − 23,21,810.79 = **Tk. 3,54,58,267.10**

**The outcome:** Bidder ক, at Tk. 3,40,57,525, is the lowest price in the room — and falls below the cut-off. Bidder ক is declared an SLT and rejected. The award goes to the lowest bidder above the line.

That is the whole point of the rule in one example: the lowest bidder lost.

---

### How the Process Works Beyond Schedule-18 (Rule 118)

Schedule-18 gives the SLT calculation. Rule 118 — the main evaluation rule — governs what happens around it. Reading them together answers the questions the Schedule alone leaves open.

**Which price is tested — submitted or corrected?** The corrected one. Rule 118(25) is explicit: SLT identification happens *after* applying arithmetic correction, discounts, and other financial adjustments to the acceptable tenders. So the figure that goes into the formula is your evaluated price, not your raw submitted price. Rule 118(13) adds that any discount you offer is applied *after* arithmetic errors are corrected.

**Do you get to explain a low price?** Not in the way many bidders hope. Under Rule 118(8), the evaluation committee chairman may ask you to clarify a point or provide a breakdown of your quoted unit rates — but the same sub-rule prohibits any clarification that would change the substance of the tender, such as price or delivery schedule. Rule 118(9) requires every clarification to be in writing over the chairman's signature. In short: you can be asked to *break down* your rates, but you cannot *revise* your price to escape the SLT cut-off.

**What if the committee thinks your pricing is unbalanced?** Rule 118(15) covers this separately from SLT. If prices are not quoted in a balanced way, the committee can direct you to provide a full price breakdown, and in cases of front-loaded unit rates, it can recommend an increased performance security. This is a distinct mechanism from the SLT cut-off — one manages risk on an accepted bid, the other rejects a bid outright.

**What happens after SLT bids are removed?** Rule 118(26) is clear: once significantly low-priced tenders are identified and treated as non-responsive, the lowest bidder among the *remaining* acceptable tenders is recommended for award. That is the direct consequence the worked example above demonstrated — the lowest overall bidder was cut, and the award moved up the list.

**When must the committee stop evaluating you entirely?** Rule 118(17): if you fail to prove qualification under Rule 65, or you do not accept an arithmetic correction under 118(12), or your tender is simply not responsive, evaluation of your tender does not continue.

---

### What Still Sits Outside These Rules

Even with Rule 118 and Schedule-18 together, two things are governed elsewhere and should be confirmed against the tender document and the Act:

**Formal complaint and review.** If you believe the SLT calculation was applied wrongly, the complaint and review mechanism under the Public Procurement Act and Rules applies — but the specific steps and deadlines are outside Rule 118 itself.

**Collusion checks.** Rule 118(31) notes that in tie situations the committee first examines for possible collusive practice and, if found, proceeds under Rule 149. If low bids across a tender look coordinated, that is a separate track from SLT.

When any of this affects your bid, ask at the pre-bid meeting and keep the written clarification. The procuring entity's clarification is authoritative; an assumption is not.

---

### A Practical Pre-Submission Checklist

The following is practical guidance, not a requirement of the Rules. It is aimed at one thing: being able to defend your price if it is ever questioned.

**Build the price from the bottom up.** Materials, labour, plant and equipment, transport, overhead, and a real margin. A rate you cannot reconstruct is a rate you cannot defend.

**Keep the evidence behind unusually efficient rates.** If you can genuinely do a line item cheaper — because you own the plant, have a supply agreement, or the site is close to your yard — write down why and keep the supporting quotation or agreement.

**Sanity-check against the official estimate.** Remember the upper filter: more than 10% above and you are out immediately. Far below and you risk the SLT cut-off. Know where you sit relative to the estimate before you submit.

**Do not price to beat a number you cannot see.** The cut-off depends on competitors' prices and an index published after opening. Pricing to "just clear" an imagined threshold is guesswork.

**Retain your working papers.** If your bid is rejected and you want an explanation, your own cost build-up is the first document you will need.

---

### What This Means for How You Price

**You cannot calculate the cut-off in advance.** Half the weight depends on what your competitors bid, which you do not know until opening. Any figure you work out beforehand is an estimate, not a threshold.

**Both extremes are now dangerous.** More than 10% above estimate and you are out immediately. Below the calculated cut-off and you are out as an SLT. The safe zone is between them — and it is defined by real costs, not by guessing.

**Price from your build-up.** Materials, labour, plant, overhead, and a genuine margin. If that honest number cannot win, the tender was not yours.

---

### But Price Is the Last Battle, Not the First

SLT only becomes relevant if your tender reaches financial evaluation at all. Most do not.

They fail earlier — liquid assets short once ongoing commitments are deducted, a required Site Engineer missing, an equipment list without ownership documents, a certificate that expired last month. In the example above, bidder চ never reached the formula: it was already not acceptable.

**eGPTenderHub checks that first battle for you.** Upload the tender notice and the AI evaluates every criterion against your company profile — net available liquid assets, tender capacity, key personnel, equipment, and mandatory documents — and tells you plainly whether you qualify and what is missing.

**Get past eligibility before you worry about the cut-off. Check your position at egptenderhub.com.**

---

*Source: Public Procurement Rules 2025, Schedule-18 (framed under Rule 118(25) and (26)), Bangladesh Gazette, 28 September 2025, published by BPPA. Confirm the applicable provisions against your specific tender document and raise any ambiguity at the pre-bid meeting — the procuring entity's clarification is authoritative.*
      `,
      contentBn: `
## PPR 2025-এ SLT: যে সূত্র ঠিক করে আপনার কম দর টিকবে কিনা

PPR 2025-এর অধীনে সবচেয়ে কম দর দেওয়া মানেই আর জেতা নয়। একটা সূত্র এখন ঠিক করে আপনার দর বিশ্বাসযোগ্য কিনা — এবং সেটা যদি হিসাব করা নিম্নসীমার নিচে পড়ে, আপনার দরপত্র **উল্লেখযোগ্যরূপে নিম্নমূল্যের দরপত্র (SLT)** হিসেবে বাতিল হবে।

এই গাইডে **PPR 2025-এর তফসিল-১৮ (বিধি ১১৮(২৫) ও (২৬)-এর অধীনে প্রণীত)** অনুযায়ী প্রকৃত হিসাবটা তুলে ধরা হলো — যা ২৮ সেপ্টেম্বর ২০২৫-এর গেজেটে প্রকাশিত।

---

### তফসিল-১৮ SLT বলতে কী বোঝায়

SLT হলো এমন একটি দরপত্র, যেখানে দরপত্রদাতার প্রদত্ত মূল্য ও তার অন্যান্য উপাদান — দাপ্তরিক প্রাক্কলিত মূল্য, নিকট-সাম্প্রতিক বাজারমূল্য এবং অন্যান্য গ্রহণযোগ্য দরদাতাদের প্রদত্ত মূল্যের সাপেক্ষে — এতটাই কম যে দরপত্রদাতা সেই মূল্যে চুক্তি সম্পাদন করতে পারবেন না মর্মে ক্রয়কারীর নিকট গুরুতর উদ্বেগের সৃষ্টি হয়।

তফসিলটি কারণটাও স্পষ্ট করেছে। অত্যধিক নিম্নমূল্যের দরপত্র প্রাথমিকভাবে ক্রয়কারীর জন্য সুবিধাজনক মনে হতে পারে, কিন্তু বাস্তবে শেষ পর্যন্ত তা সার্বিক ব্যয়বৃদ্ধি, নিম্নমানের ফলাফল, চুক্তি সম্পাদনে বিলম্ব, এমনকি অপ্রত্যাশিতভাবে চুক্তির অবসানেরও কারণ হতে পারে। কিছু দরদাতা কেবল কাজ পাওয়ার লক্ষ্যে এমন নিম্নদর দেন যাতে ঘোষিতমূল্যে কাজ শেষ করতে সক্ষম নাও হতে পারেন। ফলে ক্রয়কারীকে একটি দুর্বল (non-performing) ইকোনমিক অপারেটরের সাথে চুক্তি ব্যবস্থাপনায় বা নতুন অপারেটর নির্বাচনে অতিরিক্ত সময় ও অর্থব্যয় করিতে হয়।

---

### SLT কোথায় প্রযোজ্য

তফসিল-১৮-এর শিরোনামেই প্রয়োগক্ষেত্র বলা আছে — **অভ্যন্তরীণ ক্রয়ের ক্ষেত্রে দরপত্র মূল্যায়ন কমিটি কর্তৃক** উল্লেখযোগ্যরূপে নিম্নমূল্যের দরপত্রসমূহকে চিহ্নিতকরণ ও মূল্যায়ন প্রক্রিয়া। অর্থাৎ এই ব্যবস্থাটি দরপত্র মূল্যায়ন কমিটির হাতে এবং অভ্যন্তরীণ ক্রয়ের জন্য প্রণীত।

সংশ্লিষ্ট একটা বিষয় অনুচ্ছেদ ৬-এ আছে। জাতীয় মূল্যসূচক গণনার সময় **অভ্যন্তরীণ ক্রয়ে সীমিত দরপত্র পদ্ধতির (LTM) ক্ষেত্রসমূহ বাদ** দেওয়া হয়।

এর বাইরে অনুমান করবেন না। আপনার দরপত্র নথিতে যদি কম দর কীভাবে বিবেচিত হবে সে বিষয়ে কিছু না থাকে, সেটাই pre-bid meeting-এ তোলার প্রশ্ন।

---

### সূচকের সংখ্যাটা কখন জানা যায়

অনুচ্ছেদ ৬ আর গেজেটের উদাহরণ মিলিয়ে সময়টা স্পষ্ট। সূচক নির্ণয় হয় দরপত্র উন্মুক্তকরণের দিন ও পূর্ববর্তী ২৭ দিনের জন্য, আর **ই-জিপি পোর্টাল সেই সংখ্যা প্রকাশ করে উন্মুক্তকরণের দিন রাত ১২টা অতিবাহিত হওয়ার পর দ্রুততম সময়ের মধ্যে।**

এর বাস্তব পরিণতি এড়ানো যায় না: আপনার দরপত্রে যে সূচক প্রয়োগ হবে, সেটা প্রকাশিতই হয় আপনার জমা দেওয়া ও দরপত্র উন্মুক্ত হওয়ার পর। ওটার বিপরীতে দর সাজানো সম্ভব নয়। কেবল নিজের খরচের বিপরীতেই সাজানো যায়।

---

### ধাপ ১: ১০% ঊর্ধ্বসীমার ছাঁকনি (প্রথমেই প্রযোজ্য)

কোনো গড় হিসাব শুরুর আগেই তফসিল-১৮-এর অনুচ্ছেদ ৭ একটা ছাঁকনি প্রয়োগ করে, যাতে হিসাবে অযাচিত প্রভাব না পড়ে:

> দাপ্তরিক প্রাক্কলিত মূল্যের চেয়ে **১০%-এর অধিক উপরে** কোনো দরপ্রস্তাব উভয় ফর্মুলায় বিবেচনা করা যাবে না — এবং সেই দরপত্রসমূহ নিজেরাও **অগ্রহণযোগ্য (non-responsive)** হিসেবে গণ্য হবে।

এটা দুদিকেই কাজ করে। অতি উচ্চ দর দিয়ে গড় বাড়িয়ে নিম্নসীমা উপরে টেনে তোলা যাবে না। আবার আপনি নিজে যদি প্রাক্কলিত মূল্যের ১০%-এর বেশি উপরে দর দেন, বাকি সব ঠিক থাকলেও প্রাথমিক মূল্যায়নেই বাদ।

---

### ধাপ ২: ভারযুক্ত গড় (x̄)

ভারযুক্ত গড় তিনটি উপাদান থেকে নির্ণয় করা হয়:

**x̄ = 0.5 × (Σxᵢ / n) + 0.2 × x_OCE + 0.3 × x_NPPI**

যেখানে:

- **xᵢ** = কারিগরিভাবে গ্রহণযোগ্য প্রতিটি দরদাতার প্রস্তাবিত মূল্য
- **n** = গ্রহণযোগ্য দরপত্রের সংখ্যা
- **x_OCE** = প্যাকেজের দাপ্তরিক প্রাক্কলিত মূল্য
- **x_NPPI** = ই-জিপি পোর্টালে সরকারি ক্রয় প্রক্রিয়ায় সাম্প্রতিক মূল্যসূচকের ভিত্তিতে প্রাপ্ত দর

তফসিল অনুযায়ী নির্ধারিত ভার:

| উপাদান | ভার (Weight) |
|---|---|
| গ্রহণযোগ্য দরদাতাদের মূল্যের গড় | **০.৫০** |
| মূল্যসূচক (NPPI) ভিত্তিক দর | **০.৩০** |
| দাপ্তরিক প্রাক্কলিত মূল্য (OCE) | **০.২০** |

ভারসাম্যটা লক্ষ্য করুন: অর্ধেক ভার নির্ভর করে আপনার প্রতিযোগীরা আসলে কত দিয়েছে তার উপর। বাকি অর্ধেক বাঁধা দাপ্তরিক প্রাক্কলন আর বাজারের সাম্প্রতিক গতিবিধির সাথে।

---

### x_NPPI কীভাবে নির্ধারিত হয়

মূল্যসূচক ক্রয়ের ক্যাটেগরি অনুযায়ী নির্ণীত হয় — পণ্য, কার্য বা ভৌতসেবা। কোনো দরপত্রের ক্ষেত্রে এটি ব্যবহার করে **দরপত্র উন্মুক্তকরণের দিন এবং তার পূর্ববর্তী ২৭ দিন — মোট ২৮ দিন।**

ওই সময়কালে সংশ্লিষ্ট ক্যাটেগরিতে চুক্তিসম্পাদনের নোটিশ জারি হওয়া সকল ক্রয় প্রক্রিয়ার (অভ্যন্তরীণ ক্রয়ে সীমিত দরপত্র পদ্ধতির ক্ষেত্র ব্যতিরেকে) দাপ্তরিক প্রাক্কলিত মূল্যের সাথে চুক্তিপ্রাপ্ত দরদাতার মূল্যের শতকরা ব্যবধানের জাতীয় গড় নির্ণয় করা হয়।

সেই জাতীয় গড় ব্যবধান আপনার দরপত্রের প্রাক্কলিত মূল্যে প্রয়োগ করে x_NPPI পাওয়া যায়। বাস্তবে, আপনার ক্যাটেগরিতে সাম্প্রতিক চুক্তিগুলো যদি প্রাক্কলনের ৮.৩২% নিচে হয়ে থাকে, তাহলে সূচকের গুণক দাঁড়ায় ০.৯১৬৮।

---

### ধাপ ৩: ওয়েটেড স্ট্যান্ডার্ড ডেভিয়েশন (Sd)

**Sd = √{ Σ(xᵢ − x̄)² / n }**

যেখানে xᵢ = প্রতিটি দরদাতার প্রস্তাবিত মূল্য, x̄ = ধাপ ২-এর ভারযুক্ত গড়, এবং n = গ্রহণযোগ্য দরদাতাদের সংখ্যা।

---

### ধাপ ৪: নিম্নসীমা

**গ্রহণযোগ্য মূল্যের নিম্নসীমা = x̄ − Sd**

এই সীমার **নিচে** থাকা সকল দর উল্লেখযোগ্যরূপে নিম্নমূল্যের দরপত্র হিসেবে বিবেচিত হবে এবং **বাতিল** বলিয়া গণ্য হবে। এরপর সীমার উপরে থাকা দরপত্রগুলোর মধ্যে মূল্যায়ন চলবে।

---

### গেজেটের নিজস্ব উদাহরণ

তফসিল-১৮-এ একটা পূর্ণ উদাহরণ দেওয়া আছে। এটা মন দিয়ে দেখা দরকার, কারণ এতে বোঝা যায় প্রতিযোগিতামূলক দেখতে একটা দর কত দ্রুত বাদ পড়তে পারে।

**প্রেক্ষাপট:** ৪ কোটি টাকা দাপ্তরিক প্রাক্কলিত ব্যয়ের একটি কার্যক্রমের জন্য দরপত্র আহ্বান করা হয় ২০ আগস্ট। দরপত্র জমা ও উন্মুক্তকরণ ১৫ সেপ্টেম্বর। সাতটি প্রতিষ্ঠান দরপত্র দাখিল করে।

**সূচক:** ১৫ সেপ্টেম্বর ও পূর্ববর্তী ২৭ দিনের জন্য NPPI দাঁড়ায় ৮.৩২% নিম্নে — অর্থাৎ গুণক **০.৯১৬৮**।

**প্রাথমিক ও কারিগরি বাছাই:**

| দরদাতা | দরমূল্য (টাকা) | অবস্থান |
|---|---|---|
| ক | ৩,৪০,৫৭,৫২৫ | গ্রহণযোগ্য |
| খ | ৩,৬৫,৩৭,৫০০ | গ্রহণযোগ্য |
| গ | ৩,৮২,৫৮,৬৫৫ | গ্রহণযোগ্য |
| ঘ | ৪,১১,৪৫,৬৮৯ | গ্রহণযোগ্য |
| ঙ | ৪,৪৮,৭৬,৯০০ | **বাদ — প্রাক্কলনের ১০%-এর অধিক ঊর্ধ্বে** |
| চ | ৩,৬০,০৪,২৬৮ | অগ্রহণযোগ্য |
| ছ | ৩,৭৭,৮৯,৩২০ | গ্রহণযোগ্য |

পাঁচজন টিকে থাকে। লক্ষ্য করুন, ঙ প্রাক্কলনের প্রায় ১২% উপরে থাকায় কোনো গড় হিসাবের আগেই ১০% ছাঁকনিতে বাদ পড়ে।

**হিসাব:**

- পাঁচটি গ্রহণযোগ্য দরের গড় = **৩,৭৫,৫৬,৯৩৭.৮০ টাকা**
- x_OCE = ৪,০০,০০,০০০ টাকা
- x_NPPI = ৪,০০,০০,০০০ × ০.৯১৬৮ = **৩,৬৬,৭২,০০০ টাকা**

ভারযুক্ত গড়:
x̄ = ০.৫ × ৩,৭৫,৫৬,৯৩৭.৮০ + ০.৩ × ৩,৬৬,৭২,০০০ + ০.২ × ৪,০০,০০,০০০
**x̄ ≈ ৩,৭৭,৮০,০৬৮.৯০ টাকা**

ওয়েটেড স্ট্যান্ডার্ড ডেভিয়েশন:
**Sd ≈ ২৩,২১,৮১০.৭৯ টাকা**

নিম্নসীমা:
৩,৭৭,৮০,০৬৮.৯০ − ২৩,২১,৮১০.৭৯ = **৩,৫৪,৫৮,২৬৭.১০ টাকা**

**ফলাফল:** দরদাতা ক-এর দর ৩,৪০,৫৭,৫২৫ টাকা — উপস্থিত সবার মধ্যে সর্বনিম্ন — কিন্তু নিম্নসীমার নিচে। ক SLT হিসেবে চিহ্নিত ও বাতিল। কাজ পান সীমার উপরে থাকা সর্বনিম্ন দরদাতা।

একটা উদাহরণেই পুরো নিয়মের মর্মার্থ: **সর্বনিম্ন দরদাতা হেরে গেলেন।**

---

### তফসিল-১৮-এর বাইরে প্রক্রিয়াটি কীভাবে চলে (বিধি ১১৮)

তফসিল-১৮ SLT-র হিসাব দেয়। বিধি ১১৮ — মূল মূল্যায়ন বিধি — তার চারপাশের প্রক্রিয়া নিয়ন্ত্রণ করে। দুটো একসাথে পড়লে তফসিল যা খোলা রাখে সেই প্রশ্নগুলোর উত্তর মেলে।

**কোন মূল্য যাচাই হয় — দাখিলকৃত নাকি সংশোধিত?** সংশোধিতটা। বিধি ১১৮(২৫) স্পষ্ট: গাণিতিক সংশোধন, মূল্যছাড় প্রয়োগ ও অন্যান্য আর্থিক প্রভাব বিবেচনার **পর** SLT চিহ্নিত হয়। অর্থাৎ সূত্রে যে সংখ্যা যায় সেটা আপনার evaluated price, কাঁচা দাখিলকৃত মূল্য নয়। বিধি ১১৮(১৩) যোগ করে — আপনার দেওয়া মূল্যছাড় গাণিতিক ত্রুটি সংশোধনের **পরে** বিবেচিত হয়।

**কম দরের ব্যাখ্যা দেওয়ার সুযোগ পান কি?** অনেকে যেভাবে আশা করেন সেভাবে নয়। বিধি ১১৮(৮) অনুযায়ী মূল্যায়ন কমিটির সভাপতি কোনো বিষয়ের ব্যাখ্যা বা উদ্ধৃত এককদরের বিভাজন চাইতে পারেন — কিন্তু একই উপবিধি নিষেধ করে এমন কোনো ব্যাখ্যা, যা দরপত্রের বিষয়বস্তু (যেমন মূল্য বা সরবরাহের সময়সূচি) পরিবর্তন করে। বিধি ১১৮(৯) অনুযায়ী প্রতিটি ব্যাখ্যা লিখিত ও সভাপতির স্বাক্ষরে হতে হবে। সংক্ষেপে: আপনাকে rate-এর **বিভাজন** চাওয়া যেতে পারে, কিন্তু SLT নিম্নসীমা এড়াতে আপনি **দাম পরিবর্তন** করতে পারবেন না।

**কমিটি যদি মনে করে আপনার দর ভারসাম্যহীন?** বিধি ১১৮(১৫) এটা SLT থেকে আলাদাভাবে ধরে। দর ভারসাম্যমূলকভাবে উদ্ধৃত না হলে কমিটি পূর্ণ বিভাজন চাইতে পারে, এবং একক দরের front loading-এর ক্ষেত্রে কার্যসম্পাদন জামানত বৃদ্ধির সুপারিশ করতে পারে। এটা SLT নিম্নসীমার থেকে ভিন্ন ব্যবস্থা — একটা গৃহীত দরের ঝুঁকি সামলায়, অন্যটা দর সরাসরি বাতিল করে।

**SLT দরপত্র বাদ পড়ার পর কী হয়?** বিধি ১১৮(২৬) পরিষ্কার: উল্লেখযোগ্যরূপে নিম্নমূল্যের দরপত্র চিহ্নিত ও অগ্রহণযোগ্য হিসেবে গণ্য হওয়ার পর, **অবশিষ্ট** গ্রহণযোগ্য দরপত্রগুলোর মধ্যে সর্বনিম্ন দরদাতাকে award-এর জন্য সুপারিশ করা হয়। উপরের উদাহরণ ঠিক এটাই দেখিয়েছে — সামগ্রিকভাবে সর্বনিম্ন দরদাতা বাদ পড়লেন, award তালিকায় উপরে উঠল।

**কমিটি কখন আপনার মূল্যায়ন সম্পূর্ণ বন্ধ করে?** বিধি ১১৮(১৭): বিধি ৬৫-এর অধীন যোগ্যতা প্রমাণে ব্যর্থ হলে, বা ১১৮(১২)-এর গাণিতিক সংশোধন গ্রহণ না করলে, বা দরপত্র গ্রহণযোগ্য না হলে — আপনার দরপত্রের মূল্যায়ন অব্যাহত থাকে না।

---

### এখনও যা এই বিধিগুলোর বাইরে

বিধি ১১৮ ও তফসিল-১৮ একসাথেও দুটো বিষয় অন্যত্র নিয়ন্ত্রিত, যা দরপত্র নথি ও আইনের সাথে মিলিয়ে নেওয়া উচিত:

**আনুষ্ঠানিক অভিযোগ ও রিভিউ।** SLT হিসাব ভুলভাবে প্রয়োগ হয়েছে মনে করলে পাবলিক প্রকিউরমেন্ট আইন ও বিধিমালার অধীন অভিযোগ ও রিভিউ ব্যবস্থা প্রযোজ্য — তবে নির্দিষ্ট ধাপ ও সময়সীমা বিধি ১১৮-এর বাইরে।

**চক্রান্ত যাচাই।** বিধি ১১৮(৩১) বলে, সমতার ক্ষেত্রে কমিটি প্রথমে সম্ভাব্য চক্রান্তমূলক কর্ম (collusive practice) খতিয়ে দেখে এবং পাওয়া গেলে বিধি ১৪৯ অনুযায়ী ব্যবস্থা নেয়। একটা দরপত্রে কম দরগুলো সমন্বিত মনে হলে সেটা SLT থেকে আলাদা পথ।

এর কোনোটি আপনার দরপত্রে প্রভাব ফেললে pre-bid meeting-এ জিজ্ঞেস করুন এবং লিখিত ব্যাখ্যা সংরক্ষণ করুন। ক্রয়কারী প্রতিষ্ঠানের ব্যাখ্যাই চূড়ান্ত; অনুমান নয়।

---

### দাখিলের আগে একটি ব্যবহারিক চেকলিস্ট

নিচেরটি ব্যবহারিক পরামর্শ, বিধিমালার শর্ত নয়। লক্ষ্য একটাই — আপনার দর যদি কখনো প্রশ্নের মুখে পড়ে, তা যেন আপনি যুক্তি দিয়ে দাঁড় করাতে পারেন।

**দর গড়ুন নিচ থেকে উপরে।** মালামাল, শ্রম, যন্ত্রপাতি, পরিবহন, overhead আর একটা প্রকৃত margin। যে rate আপনি নিজে পুনর্গঠন করতে পারবেন না, সেটা রক্ষাও করতে পারবেন না।

**অস্বাভাবিক কম rate-এর পেছনের প্রমাণ রাখুন।** কোনো item যদি সত্যিই কম খরচে করতে পারেন — যন্ত্রপাতি নিজের, সরবরাহ চুক্তি আছে, বা সাইট আপনার ইয়ার্ডের কাছে — কারণটা লিখে রাখুন এবং সহায়ক quotation বা চুক্তি সংরক্ষণ করুন।

**প্রাক্কলিত মূল্যের সাপেক্ষে যাচাই করুন।** ঊর্ধ্বসীমার কথা মনে রাখুন: ১০%-এর বেশি উপরে গেলে সাথে সাথেই বাদ। অনেক নিচে গেলে SLT নিম্নসীমার ঝুঁকি। জমা দেওয়ার আগে জানুন আপনি প্রাক্কলনের তুলনায় কোথায় দাঁড়িয়ে।

**যে সংখ্যা দেখতেই পাচ্ছেন না, তাকে হারাতে দর সাজাবেন না।** নিম্নসীমা নির্ভর করে প্রতিযোগীদের দর আর উন্মুক্তকরণের পরে প্রকাশিত সূচকের উপর। কাল্পনিক সীমা "সামান্য পার করার" দর অনুমান ছাড়া কিছু নয়।

**আপনার হিসাবের কাগজ সংরক্ষণ করুন।** দরপত্র বাতিল হলে ব্যাখ্যা চাইতে গেলে আপনার নিজের ব্যয়-বিন্যাসই প্রথম প্রয়োজনীয় নথি।

---

### আপনার দর নির্ধারণে এর অর্থ

**নিম্নসীমা আগে থেকে হিসাব করা যায় না।** অর্ধেক ভার নির্ভর করে প্রতিযোগীরা কত দেবে তার উপর, যা উন্মুক্তকরণের আগে জানার উপায় নেই। আগে থেকে বের করা যেকোনো সংখ্যা আনুমানিক, নির্ধারিত সীমা নয়।

**এখন দুই প্রান্তই বিপজ্জনক।** প্রাক্কলনের ১০%-এর বেশি উপরে গেলে সাথে সাথে বাদ। হিসাব করা নিম্নসীমার নিচে গেলে SLT হিসেবে বাদ। নিরাপদ পরিসর এই দুইয়ের মাঝে — আর সেটা নির্ধারিত হয় বাস্তব খরচ দিয়ে, অনুমান দিয়ে নয়।

**নিজের হিসাব থেকে দর গড়ুন।** মালামাল, শ্রম, যন্ত্রপাতি, overhead আর একটা প্রকৃত margin। সেই সৎ সংখ্যা যদি জিততে না পারে, দরপত্রটা আপনার জন্য ছিল না।

---

### তবে দাম শেষ যুদ্ধ, প্রথম নয়

SLT তখনই প্রাসঙ্গিক হয় যখন আপনার দরপত্র আর্থিক মূল্যায়ন পর্যন্ত পৌঁছায়। বেশিরভাগ পৌঁছায় না।

তারা আগেই বাদ পড়ে — চলমান প্রতিশ্রুতি বাদ দিলে liquid asset কম পড়ায়, প্রয়োজনীয় Site Engineer না থাকায়, মালিকানার কাগজবিহীন equipment তালিকায়, বা গত মাসে মেয়াদোত্তীর্ণ একটা সনদে। উপরের উদাহরণে দরদাতা চ সূত্র পর্যন্তই পৌঁছাননি — তিনি আগেই অগ্রহণযোগ্য।

**eGPTenderHub সেই প্রথম যুদ্ধটা আপনার জন্য যাচাই করে।** দরপত্রের notice upload করুন — AI প্রতিটি শর্ত আপনার company profile-এর সাথে মিলিয়ে দেখে: net available liquid assets, tender capacity, key personnel, equipment, বাধ্যতামূলক কাগজপত্র — এবং পরিষ্কারভাবে বলে দেয় আপনি যোগ্য কিনা আর কী missing।

**নিম্নসীমা নিয়ে ভাবার আগে eligibility পার হন। egptenderhub.com-এ আপনার অবস্থান যাচাই করুন।**

---

*সূত্র: পাবলিক প্রকিউরমেন্ট বিধিমালা ২০২৫, তফসিল-১৮ (বিধি ১১৮(২৫) ও (২৬)-এর অধীনে প্রণীত), বাংলাদেশ গেজেট, অতিরিক্ত সংখ্যা, ২৮ সেপ্টেম্বর ২০২৫, প্রকাশক BPPA। প্রযোজ্য বিধান আপনার নির্দিষ্ট দরপত্র নথির সাথে মিলিয়ে নিন এবং অস্পষ্টতা pre-bid meeting-এ তুলুন — ক্রয়কারী প্রতিষ্ঠানের ব্যাখ্যাই চূড়ান্ত।*
      `,
    },
{
      slug: 'why-tenders-become-non-responsive',
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
      slug: 'tender-capacity-formula',
      title: lang === 'bn' ? 'Tender Capacity Formula (A×N×1.25−B) কীভাবে হিসাব করবেন — উদাহরণসহ' : 'How to Calculate Tender Capacity (A×N×1.25−B) — With Worked Examples',
      excerpt: lang === 'bn' ? 'Tender Capacity-র সূত্রটা অনেকেই ভুল বোঝেন এবং B বাদ দিতে ভুলে যান। এই গাইডে সহজ উদাহরণ দিয়ে ধাপে ধাপে হিসাব দেখানো হলো।' : 'Most bidders misread the Tender Capacity formula and forget to subtract B. This guide walks through the calculation step by step with simple examples.',
      date: 'Jun 24, 2026',
      category: 'Financial',
      contentEn: `
## Understanding Tender Capacity: The Formula That Quietly Disqualifies Bidders

Tender Capacity is one of the most misunderstood financial criteria in Bangladesh's e-GP system. Many contractors meet every other requirement — turnover, liquid assets, experience — yet still get marked non-responsive because they miscalculated their Tender Capacity.

The reason is simple: most bidders look at the impressive first half of the formula and forget the part that subtracts their existing workload. This guide breaks the formula down in plain language, with worked examples, so you never make that mistake again.

---

### The Formula

Under the Standard Tender Document, Assessed Tender Capacity is calculated as:

**Assessed Tender Capacity = (A × N × 1.25) − B**

Let us define each term clearly:

- **A** = The maximum value of construction works performed in any one year during the last five years.
- **N** = The completion time of the proposed work, in years.
- **1.25** = A fixed multiplier set by the rules.
- **B** = The value of existing commitments and works to be completed during the next N years.

The most important term here is **B** — and it is the one bidders forget.

> Note: If N is less than 12 months, N is counted as 1 (one).

---

### Why B Matters So Much

Think of it this way. The first part (A × N × 1.25) measures how much work you are *theoretically* capable of taking on. But you cannot use 100% of that capacity if you are already busy with other projects.

**B is your existing workload.** Subtracting it gives your *real, available* capacity for this new tender. This is the same principle as net available liquid assets — what matters is not your total capacity on paper, but how much is actually free.

A bidder who forgets to subtract B will overstate their capacity, and during evaluation the committee will recalculate it correctly — often pushing the bidder below the required threshold.

---

### Worked Example 1: A Contractor With No Other Work

Suppose:
- A = Tk. 2,00,00,000 (your best single-year construction value in the last 5 years)
- N = 2 years (the proposed work will take 2 years)
- B = Tk. 0 (you have no ongoing commitments)

Calculation:
- A × N × 1.25 = 2,00,00,000 × 2 × 1.25 = Tk. 5,00,00,000
- Minus B (0) = **Tk. 5,00,00,000**

If the tender requires a minimum Tender Capacity of Tk. 1,15,00,000, this bidder qualifies comfortably.

---

### Worked Example 2: The Same Contractor With Ongoing Work

Now suppose the same contractor already has Tk. 3,50,00,000 worth of work in hand to be completed over the next 2 years.

- A × N × 1.25 = Tk. 5,00,00,000 (same as before)
- Minus B (3,50,00,000) = **Tk. 1,50,00,000**

The bidder still qualifies against a Tk. 1,15,00,000 requirement — but only just. Notice how the available capacity dropped from Tk. 5 crore to Tk. 1.5 crore once existing work was counted. If their ongoing commitments were a little higher, they would fail.

This is exactly why honest, accurate entry of B is critical.

---

### Common Mistakes to Avoid

The most frequent errors bidders make with Tender Capacity:

- **Forgetting B entirely** and submitting only A × N × 1.25.
- **Using the wrong A** — using an average instead of the *maximum* single-year value, or vice versa.
- **Miscounting N** — using months instead of years, or forgetting the "less than 12 months counts as 1" rule.
- **Outdated commitments** — not updating B as old projects finish and new ones start.

---

### Let the Tool Do the Math

Calculating this by hand for every tender, while also tracking your changing commitments, is tedious and error-prone. A small mistake in B can cost you the bid.

**eGPTenderHub calculates your Tender Capacity automatically.** Enter your figures once in your company profile — including your existing commitments — and the AI applies the formula correctly for every tender, showing your true available capacity against the requirement.

**Stop guessing your numbers. Check your real Tender Capacity in seconds at egptenderhub.com.**
      `,
      contentBn: `
## Tender Capacity বোঝা: যে সূত্রটি নীরবে bidder-দের বাদ দেয়

Tender Capacity বাংলাদেশের e-GP সিস্টেমে সবচেয়ে ভুল-বোঝা আর্থিক মানদণ্ডগুলোর একটি। অনেক ঠিকাদার বাকি সব শর্ত পূরণ করেন — turnover, liquid assets, অভিজ্ঞতা — তবু Tender Capacity ভুল হিসাব করার কারণে non-responsive হয়ে যান।

কারণটা সহজ: বেশিরভাগ bidder সূত্রের প্রথম, আকর্ষণীয় অংশটা দেখেন আর যে অংশটা তাদের চলমান কাজ বাদ দেয় সেটা ভুলে যান। এই গাইডে সূত্রটা সহজ ভাষায়, উদাহরণসহ ভেঙে দেখানো হলো, যাতে আপনি আর কখনো এই ভুল না করেন।

---

### সূত্রটি

Standard Tender Document অনুযায়ী, Assessed Tender Capacity হিসাব হয় এভাবে:

**Assessed Tender Capacity = (A × N × 1.25) − B**

প্রতিটি term পরিষ্কারভাবে বুঝে নিই:

- **A** = গত পাঁচ বছরের যেকোনো এক বছরে সম্পন্ন construction কাজের সর্বোচ্চ মূল্য।
- **N** = প্রস্তাবিত কাজের সম্পন্ন করার সময়, বছরে।
- **1.25** = বিধি দ্বারা নির্ধারিত একটি স্থির গুণক।
- **B** = চলমান প্রতিশ্রুতি এবং আগামী N বছরে সম্পন্ন হতে যাওয়া কাজের মূল্য।

এখানে সবচেয়ে গুরুত্বপূর্ণ term হলো **B** — এবং এটাই bidder-রা ভুলে যান।

> দ্রষ্টব্য: N যদি ১২ মাসের কম হয়, তাহলে N কে ১ (এক) হিসেবে গণ্য করা হয়।

---

### B কেন এত গুরুত্বপূর্ণ

এভাবে ভাবুন। প্রথম অংশটা (A × N × 1.25) মাপে আপনি *তাত্ত্বিকভাবে* কতটা কাজ নিতে সক্ষম। কিন্তু আপনি সেই সক্ষমতার ১০০% ব্যবহার করতে পারবেন না যদি ইতিমধ্যে অন্য কাজে ব্যস্ত থাকেন।

**B হলো আপনার চলমান কাজের ভার।** এটা বাদ দিলে এই নতুন দরপত্রের জন্য আপনার *আসল, available* সক্ষমতা পাওয়া যায়। এটা net available liquid asset-এর মতোই নীতি — কাগজে আপনার মোট সক্ষমতা নয়, বরং কতটা আসলে খালি আছে সেটাই গুরুত্বপূর্ণ।

যে bidder B বাদ দিতে ভুলে যান, তিনি তার সক্ষমতা বেশি দেখান, এবং মূল্যায়নের সময় কমিটি সেটা সঠিকভাবে আবার হিসাব করে — যা প্রায়ই bidder-কে প্রয়োজনীয় সীমার নিচে নামিয়ে দেয়।

---

### উদাহরণ ১: যে ঠিকাদারের অন্য কোনো কাজ নেই

ধরুন:
- A = ২,০০,০০,০০০ টাকা (গত ৫ বছরে আপনার সেরা এক-বছরের construction মূল্য)
- N = ২ বছর (প্রস্তাবিত কাজে ২ বছর লাগবে)
- B = ০ টাকা (আপনার কোনো চলমান প্রতিশ্রুতি নেই)

হিসাব:
- A × N × 1.25 = ২,০০,০০,০০০ × ২ × ১.২৫ = ৫,০০,০০,০০০ টাকা
- বাদ B (০) = **৫,০০,০০,০০০ টাকা**

দরপত্রে যদি ন্যূনতম Tender Capacity ১,১৫,০০,০০০ টাকা চাওয়া হয়, এই bidder সহজেই যোগ্য।

---

### উদাহরণ ২: একই ঠিকাদার, কিন্তু চলমান কাজসহ

এবার ধরুন একই ঠিকাদারের ইতিমধ্যে ৩,৫০,০০,০০০ টাকার কাজ হাতে আছে, যা আগামী ২ বছরে শেষ হবে।

- A × N × 1.25 = ৫,০০,০০,০০০ টাকা (আগের মতোই)
- বাদ B (৩,৫০,০০,০০০) = **১,৫০,০০,০০০ টাকা**

bidder এখনও ১,১৫,০০,০০০ টাকার শর্তের বিপরীতে যোগ্য — কিন্তু খুব অল্পের জন্য। লক্ষ্য করুন, চলমান কাজ গণনায় আসার পর available সক্ষমতা ৫ কোটি থেকে ১.৫ কোটিতে নেমে এলো। তাদের চলমান প্রতিশ্রুতি একটু বেশি হলেই তারা বাদ পড়তেন।

ঠিক এই কারণেই B সৎভাবে ও নির্ভুলভাবে দেওয়া অত্যন্ত জরুরি।

---

### যে ভুলগুলো এড়াবেন

Tender Capacity নিয়ে bidder-রা যে ভুলগুলো সবচেয়ে বেশি করেন:

- **B সম্পূর্ণ ভুলে যাওয়া** এবং শুধু A × N × 1.25 জমা দেওয়া।
- **ভুল A ব্যবহার** — সর্বোচ্চ এক-বছরের মূল্যের বদলে গড় ব্যবহার করা, বা উল্টোটা।
- **N ভুল গণনা** — বছরের বদলে মাস ব্যবহার করা, বা "১২ মাসের কম হলে ১ গণ্য" নিয়মটা ভুলে যাওয়া।
- **পুরনো commitments** — পুরনো কাজ শেষ হলে আর নতুন শুরু হলে B আপডেট না করা।

---

### হিসাবটা Tool-কে করতে দিন

প্রতিটা দরপত্রের জন্য হাতে হাতে এই হিসাব করা, সেই সাথে পরিবর্তনশীল commitments-ও ট্র্যাক করা — ক্লান্তিকর এবং ভুল হওয়ার ঝুঁকিপূর্ণ। B-তে একটা ছোট ভুল আপনার bid হারাতে পারে।

**eGPTenderHub আপনার Tender Capacity স্বয়ংক্রিয়ভাবে হিসাব করে।** আপনার company profile-এ একবার তথ্য দিন — চলমান commitments সহ — এবং AI প্রতিটা দরপত্রের জন্য সূত্রটা সঠিকভাবে প্রয়োগ করে, শর্তের বিপরীতে আপনার আসল available সক্ষমতা দেখায়।

**আর সংখ্যা নিয়ে অনুমান নয়। egptenderhub.com-এ সেকেন্ডে আপনার আসল Tender Capacity যাচাই করুন।**
      `,
    },
    {
      slug: 'egp-registration-profile-update',
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
      slug: 'ppr-2025-guidelines',
            title: lang === 'bn' ? 'PPR 2025-এ নতুন কী কী এসেছে — ঠিকাদারদের জন্য সম্পূর্ণ গাইড' : 'What is New in PPR 2025 — A Complete Guide for Contractors',
      excerpt: lang === 'bn' ? '২৮ সেপ্টেম্বর ২০২৫-এ জারি হওয়া PPR 2025 বাংলাদেশের সরকারি ক্রয়ে বড় পরিবর্তন এনেছে — ±১০% সীমা বিলুপ্ত, SLT সিস্টেম, beneficial owner প্রকাশ। ঠিকাদারদের জন্য এর অর্থ কী।' : 'PPR 2025, issued 28 September 2025, brought major changes to Bangladesh public procurement — the ±10% cap is gone, SLT arrived, beneficial ownership must be disclosed. Here is what it means for contractors.',
      date: 'Jul 16, 2026',
      category: 'Compliance',
      contentEn: `
## What Changed in PPR 2025 — And What It Means for Your Bids

On **28 September 2025**, the Public Procurement Rules 2025 (PPR 2025) were issued, replacing the long-standing PPR 2008. There is a structural change worth noting straight away: PPR 2025 was published by the **Bangladesh Public Procurement Authority (BPPA)**, whereas PPR 2008 came from the Central Procurement Technical Unit (CPTU).

This is not a cosmetic update. Several changes directly affect how you bid, how you price, and what you must disclose. This guide walks through the ones that matter most to contractors.

---

### 1. e-GP Portal Use Is Now Mandatory

Under **Rule 150(1)**, all procuring entities are obliged to use the e-GP portal for any procurement supported on the e-GP system.

**What this means for you:** offline workarounds are closing. If your e-GP profile is incomplete or your documents are not mapped and current in the system, you are not simply at a disadvantage — you may be locked out entirely.

---

### 2. The ±10% Price Cap Is Gone (National Works)

This is the change with the biggest day-to-day impact. The plus/minus 10% limit for national works procurement — long controversial — has been repealed.

**What this means for you:** the floor and ceiling that shaped bidding strategy for years no longer exist. There is no automatic protection from being undercut, and no automatic band keeping you "safe." Pricing discipline now has to come entirely from your own costing.

But the cap was not removed and replaced with nothing. It was replaced with SLT.

---

### 3. Significantly Low-priced Tender (SLT) Evaluation

PPR 2025 introduced a **formula-based system for identifying significantly low-priced tenders.** The assessment weighs the prices of technically acceptable tenderers (the average carrying roughly 50% weight), the official estimate, and recent price indices.

The purpose is to determine SLT **objectively, eliminating subjective judgement** — and tenders identified as SLT are declared non-responsive. In e-GP, the calculation runs automatically during evaluation.

**What this means for you:** bidding lowest is no longer the same as winning. An unrealistically low price is now a documented route to rejection, not a shortcut to a contract.

> Note: SLT identification does not apply to every procurement method or category. Check the specific tender document, and raise it at the pre-bid meeting if the treatment of low prices is unclear.

---

### 4. Beneficial Owner Disclosure

It is now required to **disclose the actual beneficial owner** of any contract award.

The stated purpose is to improve transparency and prevent the use of proxy bidders or one person operating through many different licences.

**What this means for you:** if you bid legitimately under your own licence, this is simply a disclosure step. If your arrangements are less straightforward, this rule is aimed squarely at them.

---

### 5. Four Procurement Categories Now

Physical services (also called non-consulting services) are now established as a **distinct procurement category**, with expanded provisions for framework agreements and negotiations.

So procurement is now divided into four categories:
1. Works
2. Goods
3. Professional (consulting) services
4. Non-consulting / physical services

**What this means for you:** the category determines which Standard Tender Document applies and which qualification criteria you are judged against. Know which category your tender falls into before you assess your eligibility.

---

### 6. Sustainable Public Procurement (SPP)

The concept of sustainable procurement has been incorporated into **Rule 6** of PPR 2025.

**What this means for you:** this is early-stage, but it signals the direction of travel. Over time, expect sustainability considerations to appear in specifications and evaluation criteria.

---

### The Constant Underneath All of This

Rules change. What does not change is that **most tenders are still lost at the eligibility stage, not the price stage.**

Liquid assets net of ongoing commitments, key personnel with the right qualifications and years, equipment with valid ownership or hire documents, certificates that have not expired — these decide whether your bid is even considered. PPR 2025 did not make any of that easier.

**eGPTenderHub reads the tender and checks every criterion against your company profile** — telling you plainly whether you qualify and exactly what is missing, before you spend days preparing a bid that cannot survive evaluation.

**Check your eligibility in minutes at egptenderhub.com.**

---

*This guide summarises key changes for contractors. For the authoritative text, consult PPR 2025 as published by BPPA, and confirm any specific requirement against the tender document and at the pre-bid meeting.*
      `,
      contentBn: `
## PPR 2025-এ কী বদলালো — এবং আপনার দরপত্রের জন্য এর অর্থ

**২৮ সেপ্টেম্বর ২০২৫** তারিখে পাবলিক প্রকিউরমেন্ট বিধিমালা ২০২৫ (PPR 2025) জারি করা হয়, যা দীর্ঘদিনের PPR 2008-এর স্থলাভিষিক্ত হয়। একটা কাঠামোগত পরিবর্তন শুরুতেই বলে রাখা দরকার: PPR 2025 প্রকাশ করেছে **বাংলাদেশ পাবলিক প্রকিউরমেন্ট অথরিটি (BPPA)**, যেখানে PPR 2008 এসেছিল সেন্ট্রাল প্রকিউরমেন্ট টেকনিক্যাল ইউনিট (CPTU) থেকে।

এটা নিছক প্রসাধনী সংশোধন নয়। বেশ কিছু পরিবর্তন সরাসরি প্রভাব ফেলে আপনি কীভাবে দর দেবেন, কীভাবে দাম নির্ধারণ করবেন, আর কী প্রকাশ করতে বাধ্য থাকবেন। এই গাইডে ঠিকাদারদের জন্য সবচেয়ে গুরুত্বপূর্ণ পরিবর্তনগুলো আলোচনা করা হলো।

---

### ১. e-GP পোর্টাল ব্যবহার এখন বাধ্যতামূলক

**বিধি ১৫০(১)** অনুযায়ী, e-GP সিস্টেমে সমর্থিত যেকোনো ক্রয়ের জন্য সকল ক্রয়কারী প্রতিষ্ঠান e-GP পোর্টাল ব্যবহার করতে বাধ্য।

**আপনার জন্য এর অর্থ:** অফলাইন বিকল্প বন্ধ হয়ে আসছে। আপনার e-GP প্রোফাইল অসম্পূর্ণ থাকলে বা কাগজপত্র সিস্টেমে map করা ও হালনাগাদ না থাকলে আপনি শুধু পিছিয়ে থাকবেন না — সম্পূর্ণ বাদ পড়তে পারেন।

---

### ২. ±১০% মূল্য সীমা বিলুপ্ত (জাতীয় works)

দৈনন্দিন কাজে সবচেয়ে বড় প্রভাব ফেলা পরিবর্তন এটাই। জাতীয় works procurement-এর জন্য দীর্ঘদিনের বিতর্কিত প্লাস/মাইনাস ১০% সীমা তুলে দেওয়া হয়েছে।

**আপনার জন্য এর অর্থ:** বছরের পর বছর যে মেঝে ও ছাদ দরপত্র কৌশল গড়ে দিয়েছিল, তা আর নেই। অন্যের কম দরে কেটে যাওয়া থেকে স্বয়ংক্রিয় সুরক্ষা নেই, আবার আপনাকে "নিরাপদ" রাখার স্বয়ংক্রিয় সীমাও নেই। দর নির্ধারণের শৃঙ্খলা এখন সম্পূর্ণভাবে আপনার নিজের হিসাব থেকে আসতে হবে।

তবে সীমাটা তুলে নিয়ে শূন্যতা রাখা হয়নি। এর জায়গায় এসেছে SLT।

---

### ৩. অত্যধিক নিম্নমূল্যের দরপত্র (SLT) মূল্যায়ন

PPR 2025 **অত্যধিক নিম্নমূল্যের দরপত্র চিহ্নিত করার জন্য একটা formula-ভিত্তিক ব্যবস্থা** চালু করেছে। এই মূল্যায়নে বিবেচিত হয় কারিগরিভাবে গ্রহণযোগ্য দরদাতাদের প্রস্তাবিত মূল্য (যার গড় প্রায় ৫০% weight বহন করে), দাপ্তরিক প্রাক্কলিত মূল্য, এবং সাম্প্রতিক মূল্যসূচক।

উদ্দেশ্য হলো SLT **বস্তুনিষ্ঠভাবে নির্ধারণ করা, ব্যক্তিগত বিচার সম্পূর্ণ বাদ দিয়ে** — এবং SLT হিসেবে চিহ্নিত দরপত্র non-responsive ঘোষণা করা হয়। e-GP-তে মূল্যায়নের সময় এই হিসাব স্বয়ংক্রিয়ভাবে চলে।

**আপনার জন্য এর অর্থ:** সবচেয়ে কম দর দেওয়া আর জেতা এখন এক কথা নয়। অবাস্তব কম দাম এখন চুক্তির শর্টকাট নয়, বরং বাতিল হওয়ার নথিভুক্ত পথ।

> দ্রষ্টব্য: SLT চিহ্নিতকরণ সব ক্রয় পদ্ধতি বা শ্রেণিতে প্রযোজ্য নয়। নির্দিষ্ট দরপত্র নথি দেখুন, এবং কম দাম কীভাবে বিবেচিত হবে তা অস্পষ্ট থাকলে pre-bid meeting-এ তুলুন।

---

### ৪. Beneficial Owner প্রকাশ

যেকোনো চুক্তি প্রদানের ক্ষেত্রে এখন **প্রকৃত beneficial owner প্রকাশ করা** বাধ্যতামূলক।

ঘোষিত উদ্দেশ্য হলো স্বচ্ছতা বৃদ্ধি এবং proxy bidder ব্যবহার বা একজন ব্যক্তির বহু ভিন্ন লাইসেন্স ব্যবহার প্রতিরোধ করা।

**আপনার জন্য এর অর্থ:** আপনি যদি নিজের লাইসেন্সে বৈধভাবে দর দেন, এটা শুধু একটা প্রকাশের ধাপ। ব্যবস্থা যদি কম সরল হয়, এই নিয়ম সরাসরি সেদিকেই লক্ষ্য করা।

---

### ৫. এখন চারটি ক্রয় শ্রেণি

Physical services (যাকে non-consulting services-ও বলা হয়) এখন একটি **স্বতন্ত্র ক্রয় শ্রেণি** হিসেবে প্রতিষ্ঠিত, framework agreement ও negotiation-এর বর্ধিত বিধান সহ।

তাই ক্রয় এখন চারটি শ্রেণিতে বিভক্ত:
১. Works (পূর্ত)
২. Goods (পণ্য)
৩. Professional (consulting) services
৪. Non-consulting / physical services

**আপনার জন্য এর অর্থ:** শ্রেণি নির্ধারণ করে কোন Standard Tender Document প্রযোজ্য হবে এবং কোন যোগ্যতার মানদণ্ডে আপনাকে বিচার করা হবে। নিজের যোগ্যতা যাচাইয়ের আগে জানুন আপনার দরপত্র কোন শ্রেণিতে পড়ে।

---

### ৬. টেকসই সরকারি ক্রয় (SPP)

টেকসই ক্রয়ের ধারণা PPR 2025-এর **বিধি ৬**-এ অন্তর্ভুক্ত করা হয়েছে।

**আপনার জন্য এর অর্থ:** এটা এখনও প্রাথমিক পর্যায়ে, তবে এটা যাত্রার দিক নির্দেশ করে। সময়ের সাথে specification ও মূল্যায়নের মানদণ্ডে টেকসইতার বিবেচনা আসবে বলে ধরে নিন।

---

### এই সবকিছুর নিচে যে ধ্রুবক

নিয়ম বদলায়। যা বদলায় না তা হলো — **বেশিরভাগ দরপত্র এখনও eligibility ধাপেই হারে, দামের ধাপে নয়।**

চলমান প্রতিশ্রুতি বাদ দিয়ে liquid assets, সঠিক যোগ্যতা ও বছরের অভিজ্ঞতাসহ key personnel, বৈধ ownership বা hire নথিসহ equipment, মেয়াদ না-ফুরানো সনদ — এগুলোই ঠিক করে আপনার দরপত্র আদৌ বিবেচিত হবে কিনা। PPR 2025 এর কোনোটাই সহজ করেনি।

**eGPTenderHub দরপত্র পড়ে প্রতিটি শর্ত আপনার company profile-এর সাথে যাচাই করে** — পরিষ্কারভাবে বলে দেয় আপনি যোগ্য কিনা আর ঠিক কী missing, এমন একটা bid তৈরিতে দিন নষ্ট করার আগেই যা মূল্যায়নে টিকবে না।

**egptenderhub.com-এ মিনিটেই আপনার eligibility যাচাই করুন।**

---

*এই গাইড ঠিকাদারদের জন্য মূল পরিবর্তনগুলোর সারসংক্ষেপ। প্রামাণিক পাঠের জন্য BPPA প্রকাশিত PPR 2025 দেখুন, এবং যেকোনো নির্দিষ্ট শর্ত দরপত্র নথি ও pre-bid meeting-এ যাচাই করে নিন।*
      `,

    },
    {
      slug: 'liquid-assets-calculation',
            title: lang === 'bn' ? 'e-GP-তে Liquid Assets কীভাবে সঠিকভাবে হিসাব করবেন — Net Available-ই আসল' : 'How to Calculate Liquid Assets for e-GP Correctly — Net Available Is What Counts',
      excerpt: lang === 'bn' ? 'দরপত্রে liquid asset চাওয়া হয় "net of other contractual commitments" — অর্থাৎ gross নয়। এই একটা শব্দবন্ধ না বোঝার কারণেই বহু ঠিকাদার বাদ পড়েন। সঠিক হিসাব ও সঠিক ফরম।' : 'Tenders require liquid assets "net of other contractual commitments" — not your gross figure. Misreading that one phrase disqualifies more bidders than almost anything else. Here is the correct calculation and the correct form.',
      date: 'Jul 16, 2026',
      category: 'Financial',
      contentEn: `
## Liquid Assets in e-GP: Why Your Gross Figure Is Not the Number That Matters

Liquid assets disqualify more bidders in Bangladesh than almost any other financial criterion — and usually not because the contractor is short of money. It is because they read the requirement wrong.

The tender asks for a minimum amount of liquid assets, credit line, or working capital. Say Tk. 65 Lakh. A contractor with Tk. 50 Lakh in the bank looks at that and thinks: close, but no. Another with Tk. 80 Lakh thinks: comfortable. Both may be wrong.

The reason sits in five words that most bidders skim past.

---

### The Phrase That Decides It: "Net of Other Contractual Commitments"

Read the requirement in the Tender Data Sheet carefully. It typically reads:

> "availability of minimum financial resources in any form or combination of forms of liquid assets or credit line(s) or working capital, **net of other contractual commitments**"

That phrase is not decoration. It is the whole test.

**Gross liquid assets** = what you have.
**Net available liquid assets** = what you have, minus what is already committed to work in hand.

Only the second number is evaluated.

---

### A Worked Example

Suppose the tender requires **Tk. 65,00,000** in liquid assets.

**Contractor A** has Tk. 80,00,000 in the bank. Comfortable, surely? But Tk. 30,00,000 is tied to three ongoing projects. Net available: **Tk. 50,00,000.** Fails.

**Contractor B** has Tk. 70,00,000 with no ongoing commitments. Net available: **Tk. 70,00,000.** Passes.

Contractor A has more money than Contractor B and still loses. That is the rule working exactly as intended — the evaluation is asking whether you can finance *this* contract, not whether you are wealthy in general.

---

### What Counts as a Liquid Asset

Generally, liquid assets are resources you can actually deploy on the contract:

1. **Cash at bank** — current or savings accounts.
2. **Fixed Deposits (FDR)** — but only those **free from lien**. An FDR pledged as security elsewhere is not liquid to you.
3. **Confirmed credit line certificates** from scheduled banks.

The common trap is the second one. Contractors count FDRs that are already pledged against other obligations. Those are not available, and an evaluation committee that checks will find it.

---

### Get the Form Right — e-PW2A-8

This is where careful contractors still lose bids on a technicality.

Tenders routinely specify that liquid asset documents must be submitted **in the Form e-PW2A-8, in original**, and often within a defined window — typically between the invitation of tender and the submission deadline.

Tender Data Sheets frequently carry a warning to this effect: *submit in the specified form, in original, otherwise the tender will be considered non-responsive.*

Three things follow from this:

**Use the exact form the tender names.** Do not send your bank's standard solvency letter and hope. Ask your bank to issue it in the format the tender document specifies.

**Watch the date window.** A certificate issued before the tender was invited may be rejected as outside the required period.

**Submit the original where the tender demands original.** A scan or copy where the original is required is a straightforward path to non-responsiveness.

---

### Common Mistakes to Avoid

- **Reporting gross instead of net.** The single biggest error.
- **Counting lien-marked FDRs** as available.
- **Using the wrong form** — a general bank solvency certificate instead of the specified e-PW2A-8.
- **A stale certificate** issued outside the permitted window.
- **Forgetting to update.** Your commitments change as projects start and finish. The figure that was true last month may not be true today.

---

### Stop Doing This Arithmetic by Hand

Working out your net available liquid assets for every tender — while your ongoing commitments shift — is tedious, and a single error costs you the bid.

**eGPTenderHub does it for you.** Enter your gross liquid assets and your existing commitments once in your company profile. For every tender you analyse, the AI subtracts what is committed and compares your **net available** figure against the requirement — showing you plainly whether you pass, and by how much.

It does the same for tender capacity, personnel, equipment, and mandatory documents.

**Know your real position before you bid. Check it in minutes at egptenderhub.com.**

---

*Confirm the exact form, amount and submission window against your specific tender document. If anything is unclear, raise it at the pre-bid meeting — the procuring entity's clarification is authoritative.*
      `,
      contentBn: `
## e-GP-তে Liquid Assets: কেন আপনার Gross সংখ্যাটা আসল সংখ্যা নয়

বাংলাদেশে অন্য যেকোনো আর্থিক মানদণ্ডের চেয়ে liquid asset বেশি bidder-কে অযোগ্য করে — এবং সাধারণত ঠিকাদারের টাকার অভাবে নয়। কারণটা হলো তারা শর্তটা ভুল পড়েন।

দরপত্রে একটা ন্যূনতম liquid asset, credit line বা working capital চাওয়া হয়। ধরুন ৬৫ লাখ টাকা। ব্যাংকে ৫০ লাখ থাকা একজন ঠিকাদার দেখে ভাবেন: কাছাকাছি, কিন্তু হবে না। ৮০ লাখ থাকা আরেকজন ভাবেন: স্বচ্ছন্দ। দুজনেই ভুল হতে পারেন।

কারণটা লুকিয়ে আছে কয়েকটা শব্দে, যা বেশিরভাগ bidder চোখ বুলিয়ে পার হয়ে যান।

---

### যে শব্দবন্ধ সিদ্ধান্ত নেয়: "Net of Other Contractual Commitments"

Tender Data Sheet-এ শর্তটা মন দিয়ে পড়ুন। সাধারণত লেখা থাকে:

> "availability of minimum financial resources in any form or combination of forms of liquid assets or credit line(s) or working capital, **net of other contractual commitments**"

এই শব্দবন্ধ অলঙ্কার নয়। এটাই পুরো পরীক্ষা।

**Gross liquid assets** = আপনার যা আছে।
**Net available liquid assets** = আপনার যা আছে, বিয়োগ যা ইতিমধ্যে হাতের কাজে প্রতিশ্রুত।

শুধু দ্বিতীয় সংখ্যাটাই মূল্যায়িত হয়।

---

### একটা উদাহরণ

ধরুন দরপত্রে **৬৫,০০,০০০ টাকা** liquid asset চাওয়া হয়েছে।

**ঠিকাদার ক**-এর ব্যাংকে ৮০,০০,০০০ টাকা। নিশ্চয়ই স্বচ্ছন্দ? কিন্তু ৩০,০০,০০০ টাকা তিনটা চলমান প্রকল্পে আটকে আছে। Net available: **৫০,০০,০০০ টাকা।** বাদ।

**ঠিকাদার খ**-এর আছে ৭০,০০,০০০ টাকা, কোনো চলমান প্রতিশ্রুতি নেই। Net available: **৭০,০০,০০০ টাকা।** উত্তীর্ণ।

ঠিকাদার ক-এর কাছে খ-এর চেয়ে বেশি টাকা, তবু তিনি হারলেন। নিয়মটা ঠিক যেভাবে কাজ করার কথা সেভাবেই কাজ করছে — মূল্যায়ন জানতে চাইছে আপনি *এই* চুক্তিটার অর্থায়ন করতে পারবেন কিনা, আপনি সাধারণভাবে ধনী কিনা তা নয়।

---

### Liquid Asset হিসেবে কী গণ্য হয়

সাধারণত liquid asset হলো সেই সম্পদ যা আপনি আসলেই চুক্তিতে নিয়োগ করতে পারবেন:

১. **ব্যাংকে নগদ** — চলতি বা সঞ্চয়ী হিসাব।
২. **ফিক্সড ডিপোজিট (FDR)** — তবে শুধুমাত্র **লিয়েনমুক্ত** গুলো। অন্য কোথাও জামানত হিসেবে বন্ধক রাখা FDR আপনার জন্য liquid নয়।
৩. তফসিলি ব্যাংক থেকে **নিশ্চিত credit line certificate**।

সাধারণ ফাঁদটা হলো দ্বিতীয়টা। ঠিকাদাররা এমন FDR গণনা করেন যা ইতিমধ্যে অন্য দায়বদ্ধতায় বন্ধক। সেগুলো available নয়, আর যাচাই করলে মূল্যায়ন কমিটি তা ধরে ফেলবে।

---

### সঠিক ফরম দিন — e-PW2A-8

এখানেই সতর্ক ঠিকাদাররাও কারিগরি কারণে দরপত্র হারান।

দরপত্রে নিয়মিতভাবে উল্লেখ থাকে যে liquid asset নথি জমা দিতে হবে **Form e-PW2A-8-এ, মূল কপিতে**, এবং প্রায়ই একটা নির্দিষ্ট সময়সীমার মধ্যে — সাধারণত দরপত্র আহ্বান থেকে জমা দেওয়ার সময়ের মধ্যে।

Tender Data Sheet-এ প্রায়ই এ বিষয়ে সতর্কবাণী থাকে: *নির্দিষ্ট ফরমে, মূল কপিতে জমা দিন, অন্যথায় দরপত্র non-responsive বিবেচিত হবে।*

এ থেকে তিনটি জিনিস অনুসরণ করে:

**দরপত্র যে ফরম উল্লেখ করেছে ঠিক সেটাই ব্যবহার করুন।** আপনার ব্যাংকের সাধারণ solvency চিঠি পাঠিয়ে আশা করবেন না। দরপত্র নথিতে উল্লেখিত ফরম্যাটে ইস্যু করতে ব্যাংককে বলুন।

**তারিখের সীমা লক্ষ্য রাখুন।** দরপত্র আহ্বানের আগে ইস্যু করা সনদ প্রয়োজনীয় সময়ের বাইরে হিসেবে বাতিল হতে পারে।

**যেখানে মূল কপি চাওয়া হয়েছে সেখানে মূল কপিই দিন।** মূল কপির জায়গায় scan বা photocopy দেওয়া non-responsive হওয়ার সহজ পথ।

---

### যে ভুলগুলো এড়াবেন

- **Net-এর বদলে gross দেখানো।** সবচেয়ে বড় একক ভুল।
- **লিয়েন-চিহ্নিত FDR** available হিসেবে গণনা করা।
- **ভুল ফরম ব্যবহার** — নির্দিষ্ট e-PW2A-8-এর বদলে সাধারণ ব্যাংক solvency সনদ।
- **পুরনো সনদ** যা অনুমোদিত সময়সীমার বাইরে ইস্যু করা।
- **হালনাগাদ করতে ভুলে যাওয়া।** প্রকল্প শুরু ও শেষ হওয়ার সাথে আপনার commitments বদলায়। গত মাসে যে সংখ্যা সত্যি ছিল, আজ তা না-ও হতে পারে।

---

### এই হিসাব আর হাতে করবেন না

প্রতিটা দরপত্রের জন্য net available liquid asset বের করা — সেই সাথে চলমান commitments বদলাতে থাকে — ক্লান্তিকর, আর একটা ভুলেই দরপত্র হারাবেন।

**eGPTenderHub এটা আপনার জন্য করে।** Company profile-এ একবার আপনার gross liquid assets আর চলমান commitments দিন। আপনি যে দরপত্রই বিশ্লেষণ করুন, AI প্রতিশ্রুত অংশ বাদ দিয়ে আপনার **net available** সংখ্যা শর্তের সাথে তুলনা করে — পরিষ্কারভাবে দেখায় আপনি উত্তীর্ণ কিনা, আর কতটা ব্যবধানে।

Tender capacity, personnel, equipment আর বাধ্যতামূলক কাগজপত্রের ক্ষেত্রেও একই কাজ করে।

**দর দেওয়ার আগে আপনার আসল অবস্থান জানুন। egptenderhub.com-এ মিনিটেই যাচাই করুন।**

---

*সঠিক ফরম, পরিমাণ ও জমা দেওয়ার সময়সীমা আপনার নির্দিষ্ট দরপত্র নথির সাথে মিলিয়ে নিন। কিছু অস্পষ্ট থাকলে pre-bid meeting-এ তুলুন — ক্রয়কারী প্রতিষ্ঠানের ব্যাখ্যাই চূড়ান্ত।*
      `,

    },
    {
      slug: 'ltm-otm-winning-strategies',
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
