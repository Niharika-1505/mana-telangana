'use client'
import { useState } from 'react'
import Header from '@/components/shared/Header'
import TransparencyFooter from '@/components/shared/TransparencyFooter'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { useLang } from '@/lib/i18n'
import type { Lang } from '@/lib/i18n'
import Link from 'next/link'
import InstallBanner from '@/components/InstallBanner'

// ── Types ────────────────────────────────────────────────────────────────────

type LangMap = { en: string; te: string; hi: string }
type FAQItem = {
  q: LangMap
  a: LangMap | ((lang: Lang) => React.ReactNode)
}
type FAQSection = { title: LangMap; items: FAQItem[] }

// ── Helpers ──────────────────────────────────────────────────────────────────

function tx(map: LangMap, lang: Lang): string {
  return map[lang] || map.en
}

// ── Page-level strings ───────────────────────────────────────────────────────

const PAGE = {
  heading: {
    en: 'Frequently Asked Questions',
    te: 'తరచుగా అడిగే ప్రశ్నలు',
    hi: 'अक्सर पूछे जाने वाले प्रश्न',
  },
  subtitle: {
    en: 'Everything you need to know about reporting, tracking, and verifying civic issues.',
    te: 'నివేదించడం, ట్రాక్ చేయడం మరియు ధృవీకరించడం గురించి మీకు తెలియవలసిన సమస్తం.',
    hi: 'रिपोर्टिंग, ट्रैकिंग और नागरिक समस्याओं के सत्यापन के बारे में जो आपको जानना चाहिए।',
  },
  cta: {
    en: 'Still have a question? Want to get involved?',
    te: 'ఇంకా ప్రశ్న ఉందా? పాల్గొనాలని ఉందా?',
    hi: 'अभी भी कोई सवाल है? जुड़ना चाहते हैं?',
  },
} satisfies Record<string, LangMap>

// ── The English title of the install section (used to inject InstallBanner) ─

const INSTALL_SECTION_EN = '📱 Save to Your Phone'

// ── FAQ data — all text is bilingual ─────────────────────────────────────────

const FAQ_DATA: FAQSection[] = [
  // ── ABOUT THE PLATFORM ───────────────────────────────────────────────────
  {
    title: {
      en: 'About the Platform',
      te: 'మన గురించి',
      hi: 'प्लेटफॉर्म के बारे में',
    },
    items: [
      {
        q: {
          en: 'What is Mana Telangana?',
          te: 'మన తెలంగాణ అంటే ఏమిటి?',
          hi: 'मना तेलंगाना क्या है?',
        },
        a: {
          en: 'A free, anonymous civic issue reporting platform for Telangana. Citizens submit geo-tagged complaints with photos. MLAs are ranked publicly by how quickly their constituency resolves reported issues.',
          te: 'తెలంగాణ పౌరుల కోసం ఒక ఉచిత, అనామక పౌర సమస్య నివేదన వేదిక. పౌరులు GPS ట్యాగ్ చేసిన ఫోటోలతో ఫిర్యాదులు సమర్పిస్తారు. ఎమ్మెల్యేలు తమ నియోజకవర్గంలో నివేదించిన సమస్యలు ఎంత వేగంగా పరిష్కరిస్తున్నారో బట్టి పాబ్లిక్‌గా ర్యాంక్ ఇవ్వబడతారు.',
          hi: 'तेलंगाना के लिए एक मुफ़्त, गुमनाम नागरिक समस्या रिपोर्टिंग प्लेटफॉर्म। नागरिक GPS टैग की गई शिकायतें फोटो के साथ सबमिट करते हैं। विधायकों को उनके क्षेत्र में रिपोर्ट की गई समस्याओं के समाधान की गति के अनुसार सार्वजनिक रूप से रैंक किया जाता है।',
        },
      },
      {
        q: {
          en: 'Who runs this platform?',
          te: 'ఈ వేదికను ఎవరు నిర్వహిస్తున్నారు?',
          hi: 'यह प्लेटफॉर्म कौन चलाता है?',
        },
        a: {
          en: 'Mana Telangana is an independent, non-profit civic initiative. We have no affiliation with any political party or government body. The platform is open source.',
          te: 'మన తెలంగాణ ఒక స్వతంత్ర, లాభాపేక్ష లేని పౌర చొరవ. ఏ రాజకీయ పార్టీతో లేదా ప్రభుత్వ సంస్థతో మాకు సంబంధం లేదు. వేదిక ఓపెన్ సోర్స్.',
          hi: 'मना तेलंगाना एक स्वतंत्र, गैर-लाभकारी नागरिक पहल है। हमारा किसी राजनीतिक दल या सरकारी निकाय से कोई संबंध नहीं है। प्लेटफॉर्म ओपन सोर्स है।',
        },
      },
      {
        q: {
          en: 'Is it free to use?',
          te: 'వాడకానికి ఉచితమా?',
          hi: 'क्या यह उपयोग के लिए मुफ़्त है?',
        },
        a: {
          en: 'Yes — completely free for everyone. No ads, no user tracking, no login required.',
          te: 'అవును — అందరికీ పూర్తిగా ఉచితం. ప్రకటనలు లేవు, వినియోగదారు ట్రాకింగ్ లేదు, లాగిన్ అవసరం లేదు.',
          hi: 'हाँ — सभी के लिए पूरी तरह मुफ़्त। कोई विज्ञापन नहीं, कोई यूज़र ट्रैकिंग नहीं, लॉगिन की जरूरत नहीं।',
        },
      },
    ],
  },

  // ── REPORTING ISSUES ─────────────────────────────────────────────────────
  {
    title: {
      en: 'Reporting Issues',
      te: 'సమస్యలు నివేదించడం',
      hi: 'समस्याएं रिपोर्ट करना',
    },
    items: [
      {
        q: {
          en: 'What types of issues can I report?',
          te: 'నేను ఏ రకమైన సమస్యలు నివేదించగలను?',
          hi: 'मैं किस प्रकार की समस्याएं रिपोर्ट कर सकता हूं?',
        },
        a: {
          en: 'Potholes, garbage dumps, drainage overflow, broken street lights, water supply problems, open drains, illegal encroachments, fallen trees, stray animal menace, and more. If it affects daily life in your ward, report it.',
          te: 'గుంతలు, చెత్త కుప్పలు, డ్రైనేజ్ అధికం, విరిగిన వీధి దీపాలు, నీటి సరఫరా సమస్యలు, తెరిచిన నాలాలు, అక్రమ ఆక్రమణలు, పడిపోయిన చెట్లు, వీధి జంతువుల సమస్యలు, మరిన్ని. మీ వార్డులో రోజువారీ జీవితాన్ని ప్రభావితం చేస్తే, నివేదించండి.',
          hi: 'गड्ढे, कचरे के ढेर, नाली का ओवरफ्लो, टूटी हुई सड़क बत्तियाँ, पानी की आपूर्ति की समस्याएं, खुली नालियाँ, अवैध अतिक्रमण, गिरे हुए पेड़, आवारा जानवरों की समस्याएं, और भी बहुत कुछ। अगर यह आपके वार्ड में दैनिक जीवन को प्रभावित करता है, तो रिपोर्ट करें।',
        },
      },
      {
        q: {
          en: 'Do I need an account or login?',
          te: 'ఖాతా లేదా లాగిన్ అవసరమా?',
          hi: 'क्या मुझे खाता या लॉगिन चाहिए?',
        },
        a: {
          en: 'No. Reports are submitted anonymously. We use a browser fingerprint — a random ID stored on your device — to let you track your own reports. No name, email, or phone is collected when you report an issue.',
          te: 'లేదు. నివేదికలు అనామకంగా సమర్పించబడతాయి. మేము బ్రౌజర్ ఫింగర్‌ప్రింట్ ఉపయోగిస్తాం — మీ పరికరంలో నిల్వ చేయబడిన రాండమ్ ID — మీ నివేదికలను ట్రాక్ చేయడానికి. సమస్య నివేదించేటప్పుడు పేరు, ఇమెయిల్ లేదా ఫోన్ సేకరించబడదు.',
          hi: 'नहीं। रिपोर्ट गुमనाम रूप से सबमिट की जाती हैं। हम ब्राउज़र फिंगरप्रिंट का उपयोग करते हैं — आपके डिवाइस पर एक रैंडम ID — आपकी रिपोर्ट ट्रैक करने के लिए। समस्या रिपोर्ट करते समय कोई नाम, ईमेल या फोन एकत्र नहीं किया जाता।',
        },
      },
      {
        q: {
          en: 'Why is a photo required?',
          te: 'ఫోటో ఎందుకు అవసరం?',
          hi: 'फोटो क्यों जरूरी है?',
        },
        a: {
          en: 'Photos are the primary evidence that an issue exists and has not yet been fixed. They also help community members independently verify whether a fix has actually happened. Without a photo, claims are unverifiable.',
          te: 'ఫోటోలు సమస్య ఉందని, ఇంకా పరిష్కరించబడలేదని నిరూపించే ప్రాథమిక సాక్ష్యాలు. పరిష్కారం జరిగిందా లేదా అని సమాజ సభ్యులు స్వతంత్రంగా ధృవీకరించడానికి కూడా అవి సహాయపడతాయి. ఫోటో లేకుండా, వాదనలు నిరూపించలేనివి.',
          hi: 'फोटो प्राथमिक साक्ष्य है कि कोई समस्या मौजूद है और अभी तक ठीक नहीं हुई है। वे सामुदायिक सदस्यों को यह स्वतंत्र रूप से सत्यापित करने में भी मदद करती हैं कि कोई सुधार हुआ है या नहीं। फोटो के बिना दावे असत्यापनीय हैं।',
        },
      },
      {
        q: {
          en: 'How does location detection work?',
          te: 'స్థాన గుర్తింపు ఎలా పని చేస్తుంది?',
          hi: 'स्थान पहचान कैसे काम करती है?',
        },
        a: {
          en: 'We use your device GPS (with your permission) to detect the nearest ward automatically. You can also select your ward manually from the dropdown if GPS is unavailable or inaccurate.',
          te: 'మేము మీ పరికరం GPS (మీ అనుమతితో) ఉపయోగించి దగ్గరలోని వార్డును స్వయంచాలకంగా గుర్తిస్తాం. GPS అందుబాటులో లేకుంటే లేదా సరికాకపోతే, డ్రాప్‌డౌన్ నుండి మీ వార్డును మాన్యువల్‌గా ఎంచుకోవచ్చు.',
          hi: 'हम आपके डिवाइस GPS (आपकी अनुमति से) का उपयोग करके निकटतम वार्ड स्वचालित रूप से पहचानते हैं। यदि GPS उपलब्ध नहीं है या सटीक नहीं है, तो आप ड्रॉपडाउन से अपना वार्ड मैन्युअल रूप से चुन सकते हैं।',
        },
      },
      {
        q: {
          en: 'What is the "This is a test submission" checkbox?',
          te: '"ఇది ఒక పరీక్ష సమర్పణ" చెక్‌బాక్స్ అంటే ఏమిటి?',
          hi: '"यह परीक्षण सबमिशन है" चेकबॉक्स क्या है?',
        },
        a: {
          en: 'If you are testing the app or exploring the form, tick this box. Test reports are hidden from the public map and can be bulk-deleted by the admin at any time.',
          te: 'మీరు యాప్ పరీక్షిస్తున్నారా లేదా ఫారమ్‌ను అన్వేషిస్తున్నారా అయితే, ఈ బాక్స్ టిక్ చేయండి. పరీక్ష నివేదికలు పబ్లిక్ మ్యాప్ నుండి దాచబడతాయి మరియు అడ్మిన్ ద్వారా ఏ సమయంలోనైనా బల్క్‌-తొలగించవచ్చు.',
          hi: 'यदि आप ऐप परीक्षण कर रहे हैं या फॉर्म देख रहे हैं, तो इस बॉक्स को टिक करें। परीक्षण रिपोर्ट सार्वजनिक नक्शे से छिपी होती हैं और एडमिन द्वारा किसी भी समय बल्क-डिलीट की जा सकती हैं।',
        },
      },
    ],
  },

  // ── AFTER YOU REPORT ─────────────────────────────────────────────────────
  {
    title: {
      en: 'After You Report',
      te: 'నివేదించిన తర్వాత',
      hi: 'रिपोर्ट के बाद',
    },
    items: [
      {
        q: {
          en: 'What happens after I submit a report?',
          te: 'నివేదిక సమర్పించిన తర్వాత ఏమి జరుగుతుంది?',
          hi: 'रिपोर्ट सबमिट करने के बाद क्या होता है?',
        },
        a: {
          en: 'Your report is immediately visible on the public map. The admin reviews it and marks it "In Progress" once acknowledged. The issue remains live until marked resolved or inactive.',
          te: 'మీ నివేదిక వెంటనే పబ్లిక్ మ్యాప్‌లో కనిపిస్తుంది. అడ్మిన్ దాన్ని సమీక్షించి "ప్రగతిలో ఉంది" అని గుర్తిస్తారు. పరిష్కరించబడింది లేదా నిష్క్రియంగా గుర్తించబడే వరకు సమస్య లైవ్‌గా ఉంటుంది.',
          hi: 'आपकी रिपोर्ट तुरंत सार्वजनिक नक्शे पर दिखती है। एडमिन इसकी समीक्षा करके इसे "इन प्रोग्रेस" के रूप में चिह्नित करते हैं। समस्या तब तक लाइव रहती है जब तक इसे हल या निष्क्रिय के रूप में चिह्नित नहीं किया जाता।',
        },
      },
      {
        q: {
          en: 'How do I track my report?',
          te: 'నా నివేదికను ఎలా ట్రాక్ చేయాలి?',
          hi: 'मैं अपनी रिपोर्ट कैसे ट्रैक करूं?',
        },
        a: {
          en: 'Visit this site on the same browser and device you used to submit. A banner at the top of the homepage will show all your open reports and let you mark them as fixed once resolved.',
          te: 'మీరు నివేదించడానికి ఉపయోగించిన అదే బ్రౌజర్ మరియు పరికరంలో ఈ సైట్ సందర్శించండి. హోమ్‌పేజ్ పైభాగంలో బ్యానర్ మీ అన్ని ఓపెన్ నివేదికలను చూపిస్తుంది మరియు పరిష్కరించబడిన తర్వాత వాటిని పరిష్కరించబడిందని గుర్తించడానికి అనుమతిస్తుంది.',
          hi: 'उसी ब्राउज़र और डिवाइस से इस साइट पर जाएं जिससे आपने सबमिट किया था। होमपेज के शीर्ष पर एक बैनर आपकी सभी खुली रिपोर्टें दिखाएगा और हल होने पर उन्हें ठीक के रूप में चिह्नित करने की अनुमति देगा।',
        },
      },
      {
        q: {
          en: 'Why can you not email or text me updates?',
          te: 'నాకు అప్‌డేట్‌లు ఎందుకు పంపలేరు?',
          hi: 'आपको ईमेल या SMS अपडेट क्यों नहीं मिल सकते?',
        },
        a: {
          en: 'We collect no contact information. This is a deliberate privacy decision — you are fully anonymous. The trade-off is that updates are pull-based: you visit the site to check status rather than receiving a push notification.',
          te: 'మేము సంప్రదింపు సమాచారం సేకరించడం లేదు. ఇది ఉద్దేశపూర్వకమైన గోప్యత నిర్ణయం — మీరు పూర్తిగా అనామకంగా ఉంటారు. దీని పర్యవసానం ఏమిటంటే, అప్‌డేట్‌లు పుల్-ఆధారితంగా ఉంటాయి: పుష్ నోటిఫికేషన్ పొందడానికి బదులుగా మీరు స్థితి తనిఖీ చేయడానికి సైట్ సందర్శించాలి.',
          hi: 'हम कोई संपर्क जानकारी एकत्र नहीं करते। यह एक जानबूझकर गोपनीयता निर्णय है — आप पूरी तरह गुमनाम हैं। इसका मतलब है अपडेट पुल-आधारित हैं: पुश नोटिफिकेशन पाने के बजाय आपको स्थिति जांचने के लिए साइट पर जाना होगा।',
        },
      },
      {
        q: {
          en: 'What if I clear my browser data?',
          te: 'బ్రౌజర్ డేటా క్లియర్ చేస్తే?',
          hi: 'यदि मैं ब्राउज़र डेटा साफ करूं तो?',
        },
        a: {
          en: 'Your report still exists on the map and in the database — it has not been deleted. But we can no longer connect it to you, so the homepage banner will not show it anymore. The report remains public and is still tracked.',
          te: 'మీ నివేదిక ఇంకా మ్యాప్‌లో మరియు డేటాబేస్లో ఉంది — తొలగించబడలేదు. కానీ మేము ఇకపై దాన్ని మీతో అనుసంధానించలేము, కాబట్టి హోమ్‌పేజ్ బ్యానర్ దాన్ని మరింత చూపించదు. నివేదిక పబ్లిక్‌గా ఉంటుంది మరియు ఇంకా ట్రాక్ చేయబడుతుంది.',
          hi: 'आपकी रिपोर्ट अभी भी नक्शे और डेटाबेस में है — इसे हटाया नहीं गया। लेकिन हम इसे अब आपसे नहीं जोड़ सकते, इसलिए होमपेज बैनर इसे और नहीं दिखाएगा। रिपोर्ट सार्वजनिक रहती है और अभी भी ट्रैक की जाती है।',
        },
      },
      {
        q: {
          en: 'What if I switch to a different browser or device?',
          te: 'వేరే బ్రౌజర్ లేదా పరికరానికి మారితే?',
          hi: 'यदि मैं अलग ब्राउज़र या डिवाइस पर स्विच करूं तो?',
        },
        a: {
          en: 'The browser fingerprint is specific to one browser on one device. Switching browsers or devices creates a new identity — the banner will not show reports from your other browser. The reports are still live on the map.',
          te: 'బ్రౌజర్ ఫింగర్‌ప్రింట్ ఒక పరికరంలోని ఒక బ్రౌజర్‌కు నిర్దిష్టంగా ఉంటుంది. బ్రౌజర్‌లు లేదా పరికరాలు మార్చడం కొత్త గుర్తింపు సృష్టిస్తుంది — బ్యానర్ మీ ఇతర బ్రౌజర్ నుండి నివేదికలు చూపించదు. నివేదికలు ఇంకా మ్యాప్‌లో లైవ్‌గా ఉంటాయి.',
          hi: 'ब्राउज़र फिंगरप्रिंट एक डिवाइस पर एक ब्राउज़र के लिए विशिष्ट होता है। ब्राउज़र या डिवाइस बदलने से एक नई पहचान बनती है — बैनर आपके दूसरे ब्राउज़र की रिपोर्ट नहीं दिखाएगा। रिपोर्टें अभी भी नक्शे पर लाइव हैं।',
        },
      },
    ],
  },

  // ── COMMUNITY VERIFICATION ───────────────────────────────────────────────
  {
    title: {
      en: 'Community Verification',
      te: 'సమాజ ధృవీకరణ',
      hi: 'सामुदायिक सत्यापन',
    },
    items: [
      {
        q: {
          en: 'What is community verification?',
          te: 'సమాజ ధృవీకరణ అంటే ఏమిటి?',
          hi: 'सामुदायिक सत्यापन क्या है?',
        },
        a: {
          en: 'Anyone can tap a report pin on the map and submit a photo saying "Yes, this is fixed" or "No, still broken." This creates a crowd-sourced evidence trail visible to everyone — including the admin.',
          te: 'ఎవరైనా మ్యాప్‌లో నివేదిక పిన్‌ను నొక్కి "అవును, పరిష్కరించబడింది" లేదా "లేదు, ఇంకా పరిష్కరించబడలేదు" అని ఫోటో సమర్పించగలరు. ఇది అందరికీ కనిపించే క్రౌడ్-సోర్స్డ్ సాక్ష్య ట్రెయిల్ సృష్టిస్తుంది — అడ్మిన్‌తో సహా.',
          hi: 'कोई भी नक्शे पर एक रिपोर्ट पिन पर टैप कर सकता है और "हाँ, यह ठीक हो गया" या "नहीं, अभी भी खराब है" कहते हुए फोटो सबमिट कर सकता है। यह एक क्राउड-सोर्स्ड साक्ष्य ट्रेल बनाता है जो सभी को दिखाई देती है — एडमिन सहित।',
        },
      },
      {
        q: {
          en: "Can I verify someone else's report?",
          te: 'నేను మరొకరి నివేదికను ధృవీకరించగలనా?',
          hi: 'क्या मैं किसी और की रिपोर्ट सत्यापित कर सकता हूं?',
        },
        a: {
          en: 'Yes, and this is actively encouraged. If you pass by a reported issue, take a photo and submit a verification. Even a "still broken" verdict is valuable — it proves the issue has not been addressed.',
          te: 'అవును, మరియు ఇది చురుకుగా ప్రోత్సహించబడుతుంది. నివేదించిన సమస్య పక్కనుండి వెళ్ళినట్లయితే, ఒక ఫోటో తీసి ధృవీకరణ సమర్పించండి. "ఇంకా పాడైంది" అని తీర్పు కూడా విలువైనది — సమస్య పరిష్కరించబడలేదని అది నిరూపిస్తుంది.',
          hi: 'हाँ, और इसे सक्रिय रूप से प्रोत्साहित किया जाता है। यदि आप किसी रिपोर्ट की गई समस्या के पास से गुजरते हैं, तो फोटो लें और सत्यापन सबमिट करें। "अभी भी खराब" का फैसला भी मूल्यवान है — यह साबित करता है कि समस्या का समाधान नहीं हुआ।',
        },
      },
      {
        q: {
          en: 'Who finally marks an issue as resolved?',
          te: 'సమస్య పరిష్కరించబడిందని ఎవరు గుర్తిస్తారు?',
          hi: 'अंत में कौन किसी समस्या को हल के रूप में चिह्नित करता है?',
        },
        a: {
          en: "The admin marks it resolved — typically after community verifications show the fix has happened, or after the MLA or municipal office provides evidence. The reporter's \"It's fixed\" flag and community verification photos are shown to the admin as evidence, but the final call is always the admin's.",
          te: 'అడ్మిన్ పరిష్కరించబడిందని గుర్తిస్తారు — సాధారణంగా సమాజ ధృవీకరణలు పరిష్కారం జరిగిందని చూపించిన తర్వాత, లేదా ఎమ్మెల్యే లేదా నగర పాలక కార్యాలయం సాక్ష్యాన్ని అందించిన తర్వాత. రిపోర్టర్ "పరిష్కరించబడింది" ఫ్లాగ్ మరియు సమాజ ధృవీకరణ ఫోటోలు అడ్మిన్‌కు సాక్ష్యంగా చూపించబడతాయి, కానీ చివరి నిర్ణయం ఎల్లప్పుడూ అడ్మిన్‌దే.',
          hi: 'एडमिन इसे हल के रूप में चिह्नित करते हैं — आमतौर पर सामुदायिक सत्यापन के बाद, या विधायक या नगरपालिका कार्यालय के साक्ष्य के बाद। रिपोर्टर का "यह ठीक हो गया" फ्लैग और सामुदायिक सत्यापन फोटो एडमिन को साक्ष्य के रूप में दिखाए जाते हैं, लेकिन अंतिम निर्णय हमेशा एडमिन का होता है।',
        },
      },
    ],
  },

  // ── THE MLA LEADERBOARD ──────────────────────────────────────────────────
  {
    title: {
      en: 'The MLA Leaderboard',
      te: 'ఎమ్మెల్యే జవాబుదారీతనం పట్టిక',
      hi: 'विधायक जवाबदेही रैंकिंग',
    },
    items: [
      {
        q: {
          en: 'How is the MLA score calculated?',
          te: 'ఎమ్మెల్యే స్కోర్ ఎలా లెక్కించబడుతుంది?',
          hi: 'विधायक का स्कोर कैसे गणना किया जाता है?',
        },
        a: {
          en: "Score = percentage of reports filed in that MLA's constituency that were marked resolved within 7 days. Higher score means faster response. The leaderboard updates in real time as reports are filed and resolved.",
          te: 'స్కోర్ = ఆ ఎమ్మెల్యే నియోజకవర్గంలో నివేదించిన, 7 రోజులలో పరిష్కరించినట్లు గుర్తించిన నివేదికల శాతం. అధిక స్కోర్ అంటే వేగవంతమైన స్పందన. నివేదికలు సమర్పించబడినప్పుడు మరియు పరిష్కరించబడినప్పుడు లీడర్‌బోర్డ్ నిజ సమయంలో అప్‌డేట్ అవుతుంది.',
          hi: 'स्कोर = उस विधायक के क्षेत्र में दर्ज रिपोर्टों का प्रतिशत जो 7 दिनों के भीतर हल के रूप में चिह्नित की गईं। उच्च स्कोर का मतलब तेज प्रतिक्रिया है। जैसे-जैसे रिपोर्ट दर्ज और हल होती हैं, लीडरबोर्ड रीयल टाइम में अपडेट होता है।',
        },
      },
      {
        q: {
          en: 'Can MLAs or officials game the score?',
          te: 'ఎమ్మెల్యేలు స్కోర్‌ను మార్చగలరా?',
          hi: 'क्या विधायक या अधिकारी स्कोर में हेरफेर कर सकते हैं?',
        },
        a: {
          en: 'The admin — not the MLA — marks issues as resolved. Community verification photos provide independent evidence of whether a fix actually happened. If an issue is marked resolved but community members keep submitting "still broken" verifications, that contradiction is visible to everyone.',
          te: 'అడ్మిన్ — ఎమ్మెల్యే కాదు — సమస్యలను పరిష్కరించబడినట్లు గుర్తిస్తారు. సమాజ ధృవీకరణ ఫోటోలు పరిష్కారం నిజంగా జరిగిందో లేదో అనే స్వతంత్ర సాక్ష్యాన్ని అందిస్తాయి. సమస్య పరిష్కరించబడినట్లు గుర్తించిన తర్వాత సమాజ సభ్యులు "ఇంకా పాడైంది" అని సమర్పించడం కొనసాగిస్తే, ఆ వైరుధ్యం అందరికీ కనిపిస్తుంది.',
          hi: 'एडमिन — विधायक नहीं — समस्याओं को हल के रूप में चिह्नित करते हैं। सामुदायिक सत्यापन फोटो स्वतंत्र साक्ष्य प्रदान करती हैं। यदि किसी समस्या को हल चिह्नित किया जाता है लेकिन सामुदायिक सदस्य "अभी भी खराब" सत्यापन सबमिट करते रहते हैं, तो वह विरोधाभास सभी को दिखाई देता है।',
        },
      },
    ],
  },

  // ── DO'S AND DON'TS ──────────────────────────────────────────────────────
  {
    title: {
      en: "Do's and Don'ts",
      te: 'చేయవలసినవి మరియు చేయకూడనివి',
      hi: 'क्या करें और क्या नहीं',
    },
    items: [
      {
        q: {
          en: 'What should I do after reporting?',
          te: 'నివేదించిన తర్వాత నేను ఏమి చేయాలి?',
          hi: 'रिपोर्ट करने के बाद मुझे क्या करना चाहिए?',
        },
        a: (lang: Lang) => {
          const items: Record<Lang, string[]> = {
            en: [
              'Return to the site periodically to check your report status',
              "Verify other people's reports if you pass by the location",
              'Spread the word — more reports = more accountability pressure',
              'Submit a community verification photo when you see a fix',
            ],
            te: [
              'మీ నివేదిక స్థితి తనిఖీ చేయడానికి సైట్‌కు తిరిగి వెళ్ళండి',
              'స్థలం పక్కనుండి వెళ్ళినట్లయితే ఇతరుల నివేదికలు ధృవీకరించండి',
              'మాట వ్యాపింపజేయండి — ఎక్కువ నివేదికలు = ఎక్కువ జవాబుదారీతనం',
              'పరిష్కారం చూసినప్పుడు సమాజ ధృవీకరణ ఫోటో సమర్పించండి',
            ],
            hi: [
              'अपनी रिपोर्ट की स्थिति जांचने के लिए साइट पर समय-समय पर वापस आएं',
              'यदि आप किसी स्थान से गुजरें तो दूसरों की रिपोर्ट सत्यापित करें',
              'बात फैलाएं — अधिक रिपोर्टें = अधिक जवाबदेही का दबाव',
              'जब आप कोई सुधार देखें तो सामुदायिक सत्यापन फोटो सबमिट करें',
            ],
          }
          return (
            <ul className="list-none space-y-1.5">
              {(items[lang] || items.en).map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-green-500 font-bold mt-0.5">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )
        },
      },
      {
        q: {
          en: 'What should I avoid?',
          te: 'నేను ఏమి చేయకూడదు?',
          hi: 'मुझे क्या नहीं करना चाहिए?',
        },
        a: (lang: Lang) => {
          const items: Record<Lang, string[]> = {
            en: [
              'Do not file false or duplicate reports — they dilute genuine issues',
              'Do not clear browser data if you want to track your report',
              'Do not switch browsers expecting to see your old reports',
              'Do not submit test reports without ticking the "This is a test" checkbox',
              'Do not report issues outside Telangana — ward data may not be available for all areas yet',
            ],
            te: [
              'తప్పుడు లేదా నకిలీ నివేదికలు సమర్పించవద్దు — అవి నిజమైన సమస్యలను తక్కువ చేస్తాయి',
              'మీ నివేదికను ట్రాక్ చేయాలంటే బ్రౌజర్ డేటా క్లియర్ చేయవద్దు',
              'పాత నివేదికలు చూడాలని బ్రౌజర్‌లు మార్చవద్దు',
              '"ఇది పరీక్ష" చెక్‌బాక్స్ టిక్ చేయకుండా పరీక్ష నివేదికలు సమర్పించవద్దు',
              'తెలంగాణ వెలుపల సమస్యలు నివేదించవద్దు — అన్ని ప్రాంతాలకు వార్డు డేటా ఇంకా అందుబాటులో ఉండకపోవచ్చు',
            ],
            hi: [
              'झूठी या डुप्लीकेट रिपोर्ट दर्ज न करें — वे वास्तविक मुद्दों को कमज़ोर करती हैं',
              'यदि आप अपनी रिपोर्ट ट्रैक करना चाहते हैं तो ब्राउज़र डेटा साफ न करें',
              'पुरानी रिपोर्ट देखने की उम्मीद में ब्राउज़र न बदलें',
              '"यह परीक्षण है" चेकबॉक्स टिक किए बिना परीक्षण रिपोर्ट सबमिट न करें',
              'तेलंगाना के बाहर की समस्याएं रिपोर्ट न करें — सभी क्षेत्रों के लिए अभी वार्ड डेटा उपलब्ध नहीं हो सकता',
            ],
          }
          return (
            <ul className="list-none space-y-1.5">
              {(items[lang] || items.en).map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-red-400 font-bold mt-0.5">✗</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )
        },
      },
    ],
  },

  // ── SAVE TO YOUR PHONE ───────────────────────────────────────────────────
  {
    title: {
      en: INSTALL_SECTION_EN,
      te: '📱 ఫోన్‌లో సేవ్ చేయండి',
      hi: '📱 फोन पर सेव करें',
    },
    items: [
      {
        q: {
          en: 'Can I save this as an app on my phone?',
          te: 'దీన్ని నా ఫోన్‌లో యాప్‌గా సేవ్ చేయగలనా?',
          hi: 'क्या मैं इसे अपने फोन पर ऐप के रूप में सेव कर सकता हूं?',
        },
        a: (lang: Lang) => {
          const intro: Record<Lang, string> = {
            en: "Yes! You can add మన తెలంగాణ to your phone's home screen and use it just like a regular app — no app store needed.",
            te: 'అవును! మన తెలంగాణను మీ ఫోన్ హోమ్ స్క్రీన్‌కు జోడించవచ్చు — యాప్ స్టోర్ అవసరం లేదు.',
            hi: 'हाँ! आप మన తెలంగాణ को अपने फोन की होम स्क्रीन पर जोड़ सकते हैं — कोई ऐप स्टोर की जरूरत नहीं।',
          }
          const androidSteps: Record<Lang, React.ReactNode[]> = {
            en: [
              <>Open <strong>manatelangana.org.in</strong> in Chrome</>,
              <>Tap the three-dots menu <strong>⋮</strong> at the top right</>,
              <>Tap <strong>&quot;Add to Home screen&quot;</strong></>,
              <>Tap <strong>&quot;Add&quot;</strong> to confirm</>,
            ],
            te: [
              <>Chrome లో <strong>manatelangana.org.in</strong> తెరవండి</>,
              <>పైన కుడివైపు మూడు చుక్కల మెనూ <strong>⋮</strong> నొక్కండి</>,
              <><strong>&quot;హోమ్ స్క్రీన్‌కు జోడించు&quot;</strong> నొక్కండి</>,
              <>నిర్ధారించడానికి <strong>&quot;జోడించు&quot;</strong> నొక్కండి</>,
            ],
            hi: [
              <>Chrome में <strong>manatelangana.org.in</strong> खोलें</>,
              <>ऊपर दाईं ओर तीन-डॉट मेनू <strong>⋮</strong> दबाएं</>,
              <><strong>&quot;होम स्क्रीन में जोड़ें&quot;</strong> दबाएं</>,
              <>पुष्टि करने के लिए <strong>&quot;जोड़ें&quot;</strong> दबाएं</>,
            ],
          }
          const iosSteps: Record<Lang, React.ReactNode[]> = {
            en: [
              <>Open <strong>manatelangana.org.in</strong> in Safari</>,
              <>Tap the Share button <strong>□↑</strong> at the bottom</>,
              <>Scroll down and tap <strong>&quot;Add to Home Screen&quot;</strong></>,
              <>Tap <strong>&quot;Add&quot;</strong> to confirm</>,
            ],
            te: [
              <>Safari లో <strong>manatelangana.org.in</strong> తెరవండి</>,
              <>కింద Share బటన్ <strong>□↑</strong> నొక్కండి</>,
              <>క్రిందకు స్క్రోల్ చేసి <strong>&quot;హోమ్ స్క్రీన్‌కు జోడించు&quot;</strong> నొక్కండి</>,
              <>నిర్ధారించడానికి <strong>&quot;జోడించు&quot;</strong> నొక్కండి</>,
            ],
            hi: [
              <>Safari में <strong>manatelangana.org.in</strong> खोलें</>,
              <>नीचे Share बटन <strong>□↑</strong> दबाएं</>,
              <>नीचे स्क्रॉल करके <strong>&quot;होम स्क्रीन में जोड़ें&quot;</strong> दबाएं</>,
              <>पुष्टि करने के लिए <strong>&quot;जोड़ें&quot;</strong> दबाएं</>,
            ],
          }
          const aSteps = androidSteps[lang] || androidSteps.en
          const iSteps = iosSteps[lang] || iosSteps.en
          return (
            <div className="space-y-4">
              <p>{intro[lang] || intro.en}</p>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="bg-slate-50 rounded-xl p-3">
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">
                    🤖 Android (Chrome)
                  </div>
                  <ol className="list-none space-y-1.5 text-sm text-slate-600">
                    {aSteps.map((step, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="flex-shrink-0 w-4 h-4 bg-green-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center mt-0.5">
                          {i + 1}
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
                <div className="bg-slate-50 rounded-xl p-3">
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">
                    🍎 iPhone (Safari)
                  </div>
                  <ol className="list-none space-y-1.5 text-sm text-slate-600">
                    {iSteps.map((step, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="flex-shrink-0 w-4 h-4 bg-slate-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center mt-0.5">
                          {i + 1}
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
          )
        },
      },
      {
        q: {
          en: 'Does it work without internet?',
          te: 'ఇంటర్నెట్ లేకుండా పని చేస్తుందా?',
          hi: 'क्या यह इंटरनेट के बिना काम करता है?',
        },
        a: {
          en: 'Basic pages load even without internet once you have visited them before. However submitting new reports requires an internet connection.',
          te: 'మీరు ముందే చూసిన పేజీలు ఇంటర్నెట్ లేకుండా తెరుచుకుంటాయి. కానీ కొత్త సమస్యలు నివేదించడానికి ఇంటర్నెట్ అవసరం.',
          hi: 'एक बार पहले देखने के बाद बुनियादी पेज बिना इंटरनेट के लोड होते हैं। हालाँकि नई रिपोर्ट सबमिट करने के लिए इंटरनेट कनेक्शन जरूरी है।',
        },
      },
      {
        q: {
          en: 'Is it free to install?',
          te: 'ఇన్‌స్టాల్ చేయడం ఉచితమా?',
          hi: 'क्या इंस्टॉल करना मुफ़्त है?',
        },
        a: {
          en: 'Completely free! No app store, no account, no charges. Just save it to your home screen and use it.',
          te: 'పూర్తిగా ఉచితం! యాప్ స్టోర్ అవసరం లేదు, ఖాతా అవసరం లేదు, ఎలాంటి చార్జీలు లేవు. హోమ్ స్క్రీన్‌కు సేవ్ చేసి వాడండి.',
          hi: 'बिल्कुल मुफ़्त! कोई ऐप स्टोर नहीं, कोई खाता नहीं, कोई शुल्क नहीं। बस इसे अपनी होम स्क्रीन पर सेव करें और उपयोग करें।',
        },
      },
      {
        q: {
          en: 'Why should I save it to my home screen?',
          te: 'హోమ్ స్క్రీన్‌కు ఎందుకు సేవ్ చేయాలి?',
          hi: 'मुझे इसे होम स्क्रीन पर क्यों सेव करना चाहिए?',
        },
        a: {
          en: 'It loads faster, works like a native app, and makes it easier to quickly report an issue when you spot one on the street.',
          te: 'వేగంగా తెరుచుకుంటుంది, నేటివ్ యాప్‌లా పని చేస్తుంది, వీధిలో సమస్య కనిపించినప్పుడు వెంటనే నివేదించడం సులభమవుతుంది.',
          hi: 'यह तेज़ी से लोड होता है, एक नेटिव ऐप की तरह काम करता है, और सड़क पर कोई समस्या देखने पर तुरंत रिपोर्ट करना आसान बनाता है।',
        },
      },
    ],
  },

  // ── GETTING INVOLVED ─────────────────────────────────────────────────────
  {
    title: {
      en: 'Getting Involved',
      te: 'పాల్గొనడం',
      hi: 'जुड़ें',
    },
    items: [
      {
        q: {
          en: 'How can I contribute to the platform?',
          te: 'వేదికకు నేను ఎలా సహాయం చేయగలను?',
          hi: 'मैं प्लेटफॉर्म में कैसे योगदान दे सकता हूं?',
        },
        a: (lang: Lang) => {
          const parts: Record<Lang, { pre: string; link: string; post: string }> = {
            en: {
              pre: 'Visit our ',
              link: 'Join Us',
              post: ' page to express interest as a ward data contributor, local activist, developer, designer, or researcher. We will reach out when we need your help — no commitment required now.',
            },
            te: {
              pre: 'వార్డు డేటా కంట్రిబ్యూటర్, స్థానిక కార్యకర్త, డెవలపర్, డిజైనర్ లేదా పరిశోధకుడిగా ఆసక్తిని నమోదు చేయడానికి మా ',
              link: 'చేరండి',
              post: ' పేజీ సందర్శించండి. మేము సహాయం కోసం సంప్రదిస్తాం — ఇప్పుడు ఎలాంటి నిబద్ధత అవసరం లేదు.',
            },
            hi: {
              pre: 'वार्ड डेटा योगदानकर्ता, स्थानीय कार्यकर्ता, डेवलपर, डिज़ाइनर, या शोधकर्ता के रूप में रुचि दर्ज करने के लिए हमारे ',
              link: 'जुड़ें',
              post: ' पेज पर जाएं। जरूरत पड़ने पर हम संपर्क करेंगे — अभी कोई प्रतिबद्धता जरूरी नहीं।',
            },
          }
          const p = parts[lang] || parts.en
          return (
            <span>
              {p.pre}
              <Link href="/join" className="text-green-600 underline font-medium hover:text-green-700">
                {p.link}
              </Link>
              {p.post}
            </span>
          )
        },
      },
      {
        q: {
          en: 'What is a Ward Data Contributor?',
          te: 'వార్డు డేటా కంట్రిబ్యూటర్ అంటే ఏమిటి?',
          hi: 'वार्ड डेटा योगदानकर्ता क्या है?',
        },
        a: {
          en: 'Someone who helps us collect or verify ward-level data for Telangana — ward boundaries, GPS coordinates, mandal names, MLA and MP information. This is the most urgent need right now as we build out the platform.',
          te: 'తెలంగాణ వార్డు-స్థాయి డేటా సేకరించడంలో లేదా ధృవీకరించడంలో సహాయపడే వ్యక్తి — వార్డు హద్దులు, GPS కోఆర్డినేట్‌లు, మండల్ పేర్లు, ఎమ్మెల్యే మరియు MP సమాచారం. వేదికను విస్తరిస్తున్నప్పుడు ఇది ఇప్పుడు అత్యంత అవసరమైన అవసరం.',
          hi: 'वह व्यक्ति जो तेलंगाना के लिए वार्ड-स्तरीय डेटा संग्रह या सत्यापित करने में मदद करता है — वार्ड की सीमाएं, GPS निर्देशांक, मंडल नाम, विधायक और सांसद की जानकारी। जैसे-जैसे हम प्लेटफॉर्म विकसित कर रहे हैं, यह अभी सबसे जरूरी जरूरत है।',
        },
      },
      {
        q: {
          en: 'Is the platform open source?',
          te: 'వేదిక ఓపెన్ సోర్స్‌ అా?',
          hi: 'क्या प्लेटफॉर्म ओपन सोर्स है?',
        },
        a: {
          en: 'Yes. The code is publicly available on GitHub. Developers are welcome to contribute.',
          te: 'అవును. కోడ్ GitHub లో పాబ్లిక్‌గా అందుబాటులో ఉంది. డెవలపర్‌లు సహాయం చేయడానికి స్వాగతం.',
          hi: 'हाँ। कोड GitHub पर सार्वजनिक रूप से उपलब्ध है। डेवलपर्स का योगदान स्वागत है।',
        },
      },
    ],
  },
]

// ── Accordion item component ──────────────────────────────────────────────────

function AccordionItem({ item, lang }: { item: FAQItem; lang: Lang }) {
  const [open, setOpen] = useState(false)
  const q = tx(item.q, lang)
  const a = typeof item.a === 'function' ? item.a(lang) : tx(item.a, lang)
  return (
    <div className="border-b border-slate-100 last:border-0">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-start justify-between gap-4 py-4 text-left group"
      >
        <span className="text-sm font-medium text-slate-800 group-hover:text-green-700 transition-colors">
          {q}
        </span>
        {open
          ? <ChevronUp size={16} className="text-green-600 flex-shrink-0 mt-0.5" />
          : <ChevronDown size={16} className="text-slate-400 flex-shrink-0 mt-0.5" />
        }
      </button>
      {open && (
        <div className="pb-4 text-sm text-slate-600 leading-relaxed -mt-1">
          {a}
        </div>
      )}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function FAQPage() {
  const { lang, t } = useLang()

  return (
    <>
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">
            {t('nav_faq')} — {tx(PAGE.heading, lang)}
          </h1>
          <p className="text-sm text-slate-400">
            {tx(PAGE.subtitle, lang)}
          </p>
        </div>

        <div className="space-y-5">
          {FAQ_DATA.map(section => (
            <div key={section.title.en} className="card overflow-hidden">
              <div className="bg-slate-50 border-b border-slate-100 px-5 py-3">
                <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                  {tx(section.title, lang)}
                </h2>
              </div>
              {section.title.en === INSTALL_SECTION_EN && (
                <div className="px-5 pt-4">
                  <InstallBanner />
                </div>
              )}
              <div className="px-5">
                {section.items.map((item, idx) => (
                  <AccordionItem key={idx} item={item} lang={lang} />
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 card p-5 text-center bg-green-50 border-green-200">
          <p className="text-sm text-green-800 mb-3">
            {tx(PAGE.cta, lang)}
          </p>
          <Link
            href="/join"
            className="btn-primary px-6 py-2.5 text-sm inline-flex items-center gap-2"
          >
            💚 {t('nav_join')}
          </Link>
        </div>
      </main>
      <TransparencyFooter />
    </>
  )
}
