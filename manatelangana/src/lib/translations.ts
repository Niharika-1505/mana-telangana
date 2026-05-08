export type Lang = 'te' | 'en' | 'hi'

const translations = {
  // Nav
  nav_map:         { en: 'Map',         te: 'నక్ష',             hi: 'नक्शा' },
  nav_leaderboard: { en: 'Leaderboard', te: 'జవాబుదారీతనం',    hi: 'जवाबदेही' },
  nav_report:      { en: 'Report',      te: 'నివేదించు',        hi: 'रिपोर्ट' },

  // StatsBar
  stats_total:      { en: 'Total Reports', te: 'మొత్తం నివేదికలు',   hi: 'कुल रिपोर्टें' },
  stats_open:       { en: 'Open Issues',   te: 'పెండింగ్ సమస్యలు',   hi: 'खुले मुद्दे' },
  stats_resolved:   { en: 'Resolved',      te: 'పరిష్కరించబడింది',    hi: 'हल हुए' },
  stats_inprogress: { en: 'In Progress',   te: 'ప్రగతిలో ఉంది',      hi: 'जारी है' },

  // RecentReports
  recent_title: { en: 'Recent Reports',    te: 'తాజా నివేదికలు',          hi: 'हाल की रिपोर्टें' },
  recent_empty: { en: 'No reports yet.',   te: 'ఇంకా నివేదికలు లేవు.',   hi: 'अभी तक कोई रिपोर्ट नहीं.' },
  recent_first: { en: 'Be the first!',     te: 'మొదటిగా నివేదించండి!',   hi: 'पहले बनें!' },
  recent_mandal:{ en: 'Mandal',            te: 'మండల్',                   hi: 'मंडल' },
  recent_mla:   { en: 'MLA',               te: 'ఎమ్మెల్యే',               hi: 'विधायक' },

  // IssueBreakdown
  breakdown_title: { en: 'Issues by Type', te: 'సమస్యల వర్గీకరణ', hi: 'प्रकार अनुसार समस्याएं' },

  // MapView
  map_live:           { en: 'Live Map · Nalgonda District', te: 'లైవ్ మ్యాప్ · నల్గొండ జిల్లా',   hi: 'लाइव नक्शा · नलगोंडा जिला' },
  map_report_btn:     { en: '+ Report Issue',               te: '+ సమస్య నివేదించు',              hi: '+ समस्या रिपोर्ट करें' },
  map_filter_all:     { en: 'All',                          te: 'అన్నీ',                           hi: 'सभी' },
  map_filter_garbage: { en: 'Garbage',                      te: 'చెత్త',                           hi: 'कचरा' },
  map_filter_pothole: { en: 'Pothole',                      te: 'గుంత',                            hi: 'गड्ढा' },
  map_filter_drainage:{ en: 'Drainage',                     te: 'నీటి వ్యవస్థ',                   hi: 'नाली' },
  map_filter_light:   { en: 'Light',                        te: 'వెలుతురు',                        hi: 'बत्ती' },
  map_filter_water:   { en: 'Water',                        te: 'నీరు',                            hi: 'पानी' },

  // Report page
  report_title:         { en: 'Report a Civic Issue',               te: 'సమస్యను నివేదించండి',                      hi: 'नागरिक समस्या रिपोर्ट करें' },
  report_subtitle:      { en: 'Anonymous · No login needed',        te: 'అనామక · లాగిన్ అవసరం లేదు',              hi: 'गुमनाम · लॉगिन जरूरी नहीं' },
  report_issue_type:    { en: 'Issue Type',                         te: 'సమస్య రకం',                               hi: 'समस्या का प्रकार' },
  report_photo:         { en: 'Photo Evidence',                     te: 'ఫోటో నిదర్శనం',                           hi: 'फोटो साक्ष्य' },
  report_photo_tap:     { en: 'Tap to take photo or upload',        te: 'ఫోటో తీయండి లేదా అప్లోడ్ చేయండి',      hi: 'फोटो लें या अपलोड करें' },
  report_photo_remove:  { en: 'Remove',                             te: 'తొలగించు',                                hi: 'हटाएं' },
  report_location:      { en: 'Location',                           te: 'స్థానం',                                  hi: 'स्थान' },
  report_detect:        { en: 'Auto-detect my location',            te: 'నా స్థానాన్ని స్వయంచాలకంగా గుర్తించు', hi: 'मेरी स्थान स्वतः पहचानें' },
  report_detecting:     { en: 'Detecting...',                       te: 'గుర్తిస్తోంది...',                        hi: 'पहचान रहे हैं...' },
  report_select_ward:   { en: 'Or select ward manually',            te: 'లేదా వార్డు ఎంచుకోండి',                  hi: 'या वार्ड चुनें' },
  report_landmark_ph:   { en: 'Landmark (e.g. Near Nalgonda Bus Stand)', te: 'సమీప ప్రదేశం (ఉ.దా. బస్ స్టాండ్ దగ్గర)', hi: 'स्थलचिह्न (जैसे नलगोंडा बस स्टैंड के पास)' },
  report_severity:      { en: 'Severity',                           te: 'తీవ్రత',                                  hi: 'गंभीरता' },
  report_sev_low:       { en: 'Low',                                te: 'తక్కువ',                                  hi: 'कम' },
  report_sev_medium:    { en: 'Medium',                             te: 'మధ్యమ',                                   hi: 'मध्यम' },
  report_sev_high:      { en: 'High',                               te: 'అధిక',                                    hi: 'अधिक' },
  report_description:   { en: 'Description (optional)',             te: 'వివరణ (ఐచ్ఛికం)',                        hi: 'विवरण (वैकल्पिक)' },
  report_desc_ph:       { en: 'Any additional details...',          te: 'అదనపు వివరాలు...',                       hi: 'अतिरिक्त जानकारी...' },
  report_test_label:    { en: 'This is a test submission',          te: 'ఇది ఒక పరీక్ష సమర్పణ',                  hi: 'यह परीक्षण सबमिशन है' },
  report_test_hint:     { en: 'Test reports are hidden from the public map and can be bulk-deleted by admins', te: 'పరీక్ష నివేదికలు పట్టిక నుండి దాచబడతాయి మరియు అడ్మిన్‌లు తొలగించవచ్చు', hi: 'परीक्षण रिपोर्टें सार्वजनिक नक्शे से छिपी होती हैं' },
  report_submit:        { en: 'Submit Report',                      te: 'నివేదించు',                               hi: 'रिपोर्ट सबमिट करें' },
  report_submitting:    { en: 'Submitting...',                      te: 'సమర్పిస్తోంది...',                       hi: 'सबमिट हो रहा है...' },
  report_anon_note:     { en: '🔒 Anonymous · No account needed',   te: '🔒 అనామక · ఖాతా అవసరం లేదు',           hi: '🔒 गुमनाम · खाता जरूरी नहीं' },
  report_done_title:    { en: 'Report Submitted!',                  te: 'నివేదిక సమర్పించబడింది!',               hi: 'रिपोर्ट सबमिट हुई!' },
  report_done_msg:      { en: 'Your MLA has been notified. Redirecting to map...', te: 'మీ ఎమ్మెల్యేకు తెలియజేయబడింది. మ్యాప్‌కు మళ్ళిస్తున్నాం...', hi: 'आपके विधायक को सूचित किया गया। नक्शे पर जा रहे हैं...' },
  report_mla_label:     { en: 'MLA',                                te: 'ఎమ్మెల్యే',                               hi: 'विधायक' },
  report_mp_label:      { en: 'MP',                                 te: 'ఎంపీ',                                    hi: 'सांसद' },

  // Leaderboard
  lb_title:        { en: 'MLA Accountability Leaderboard',          te: 'ఎమ్మెల్యే జవాబుదారీతనం పట్టిక',      hi: 'विधायक जवाबदेही रैंकिंग' },
  lb_subtitle:     { en: 'How fast are issues being resolved?',     te: 'సమస్యలు ఎంత వేగంగా పరిష్కరిస్తున్నారు?', hi: 'समस्याएं कितनी जल्दी हल होती हैं?' },
  lb_updated:      { en: 'Updated live',                            te: 'నిరంతరం నవీకరించబడుతోంది',            hi: 'लाइव अपडेट' },
  lb_district:     { en: 'Nalgonda District · 2026',               te: 'నల్గొండ జిల్లా · 2026',              hi: 'नलगोंडा जिला · 2026' },
  lb_good:         { en: 'Score ≥ 70% — Good',                     te: 'స్కోర్ ≥ 70% — మంచి',               hi: 'स्कोर ≥ 70% — अच्छा' },
  lb_moderate:     { en: 'Score 40–70% — Moderate',                te: 'స్కోర్ 40–70% — మధ్యమ',             hi: 'स्कोर 40–70% — ठीक' },
  lb_poor:         { en: 'Score < 40% — Needs attention',          te: 'స్కోర్ < 40% — దృష్టి అవసరం',       hi: 'स्कोर < 40% — ध्यान चाहिए' },
  lb_rank:         { en: 'Rank',                                    te: 'స్థానం',                              hi: 'रैंक' },
  lb_mla_col:      { en: 'MLA / Constituency',                     te: 'ఎమ్మెల్యే / నియోజకవర్గం',           hi: 'विधायक / निर्वाचन क्षेत्र' },
  lb_issues:       { en: 'Issues',                                  te: 'సమస్యలు',                             hi: 'समस्याएं' },
  lb_resolved:     { en: 'Resolved',                                te: 'పరిష్కరించబడింది',                    hi: 'हल हुए' },
  lb_pending:      { en: 'Pending',                                 te: 'పెండింగ్',                            hi: 'बकाया' },
  lb_score:        { en: 'Score',                                   te: 'స్కోర్',                              hi: 'स्कोर' },
  lb_loading:      { en: 'Loading leaderboard...',                  te: 'లీడర్‌బోర్డ్ లోడవుతోంది...',        hi: 'लीडरबोर्ड लोड हो रहा है...' },
  lb_empty:        { en: 'No reports yet — be the first to report an issue!', te: 'ఇంకా నివేదికలు లేవు — మొదటగా నివేదించండి!', hi: 'अभी तक कोई रिपोर्ट नहीं — पहले रिपोर्ट करें!' },
  lb_constituency: { en: 'Constituency',                            te: 'నియోజకవర్గం',                        hi: 'निर्वाचन क्षेत्र' },
  lb_note:         { en: 'Score = % of issues resolved within 7 days of reporting. Updated in real time as citizens report and issues get resolved. Data is entirely citizen-sourced and anonymous.', te: 'స్కోర్ = 7 రోజులలో పరిష్కరించిన సమస్యల శాతం. డేటా పౌరులు అందించింది, అనామకంగా.', hi: 'स्कोर = 7 दिनों में हल की गई समस्याओं का प्रतिशत। डेटा नागरिकों द्वारा, गुमनाम।' },

  // TransparencyFooter
  footer_running:        { en: 'Platform running',               te: 'వేదిక నడుస్తోంది',               hi: 'प्लेटफॉर्म चालू है' },
  footer_monthly:        { en: 'Monthly cost',                  te: 'నెలసరి ఖర్చు',                  hi: 'मासिक खर्च' },
  footer_annual:         { en: 'Annual cost',                   te: 'వార్షిక ఖర్చు',                  hi: 'वार्षिक खर्च' },
  footer_perday:         { en: 'Per day',                       te: 'రోజుకి',                         hi: 'प्रतिदिन' },
  footer_total_reports:  { en: 'Total reports',                 te: 'మొత్తం నివేదికలు',              hi: 'कुल रिपोर्टें' },
  footer_contributed:    { en: 'Citizens contributed',          te: 'పౌరులు సహాయం చేసారు',           hi: 'नागरिकों का योगदान' },
  footer_from:           { en: 'from',                          te: 'నుండి',                          hi: 'से' },
  footer_people:         { en: 'people',                        te: 'మంది',                           hi: 'लोग' },
  footer_hide:           { en: '▲ Hide details',                te: '▲ వివరాలు దాచు',                hi: '▲ विवरण छिपाएं' },
  footer_show:           { en: '▼ Show transparency details',   te: '▼ పారదర్శకత వివరాలు',           hi: '▼ पारदर्शिता विवरण' },
  footer_platform_costs: { en: 'Platform Costs',                te: 'వేదిక ఖర్చులు',                  hi: 'प्लेटफॉर्म खर्च' },
  footer_citizen_fund:   { en: 'Citizen Fund',                  te: 'పౌర నిధి',                       hi: 'नागरिक निधि' },
  footer_community_prop: { en: 'Community Proposals',           te: 'ప్రజా ప్రతిపాదనలు',             hi: 'सामुदायिक प्रस्ताव' },
  footer_total_coll:     { en: 'Total collected',               te: 'మొత్తం సేకరించబడింది',          hi: 'कुल एकत्रित' },
  footer_contributors:   { en: 'Contributors',                  te: 'సహాయకులు',                       hi: 'योगदानकर्ता' },
  footer_citizens:       { en: 'citizens',                      te: 'పౌరులు',                         hi: 'नागरिक' },
  footer_plat_cost_lbl:  { en: 'Platform costs',                te: 'వేదిక ఖర్చులు',                  hi: 'प्लेटफॉर्म खर्च' },
  footer_available:      { en: 'Available for community',       te: 'సమాజానికి అందుబాటు',            hi: 'समुदाय के लिए उपलब्ध' },
  footer_contribute_btn: { en: 'Contribute ₹2',                 te: '₹2 సహాయం చేయండి',               hi: '₹2 योगदान करें' },
  footer_view_prop:      { en: 'View all proposals',            te: 'అన్ని ప్రతిపాదనలు',             hi: 'सभी प्रस्ताव देखें' },
  footer_total_month:    { en: 'Total / month',                 te: 'మొత్తం / నెల',                   hi: 'कुल / माह' },
  footer_no_prop:        { en: 'No proposals yet. Be the first to suggest how to use the community fund!', te: 'ఇంకా ప్రతిపాదనలు లేవు. సమాజ నిధి వినియోగం గురించి మొదట సూచించండి!', hi: 'अभी कोई प्रस्ताव नहीं। सामुदायिक निधि के उपयोग का पहले सुझाएं!' },
  footer_votes:          { en: 'votes',                         te: 'ఓట్లు',                          hi: 'वोट' },
  footer_open_source:    { en: 'Open source civic platform',    te: 'ఓపెన్ సోర్స్ పౌర వేదిక',        hi: 'ओपन सोर्स नागरिक मंच' },
  footer_no_tracking:    { en: 'No ads. No tracking. No login.', te: 'ప్రకటనలు లేవు. ట్రాకింగ్ లేదు. లాగిన్ లేదు.', hi: 'कोई विज्ञापन नहीं। कोई ट्रैकिंग नहीं। लॉगिन नहीं।' },
  footer_free:           { en: 'FREE',                          te: 'ఉచితం',                          hi: 'मुफ़्त' },
}

export const T = translations
export type TKey = keyof typeof T
