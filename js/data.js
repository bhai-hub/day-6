window.SKALA_DATA = (() => {
  const products = [
    {
      id: 'suture-noir',
      code: 'SPECIMEN // 01',
      title: 'SUTURE NOIR',
      spec: 'Blackened 950 Platinum · 1.85 ct Brutalist Solitaire & Triple Pavé Flank',
      craftNote:
        'Milled from dense surgical-grade platinum quenched in obsidian oil. Three linear pavé trenches catch theatre overhead light cleanly along a steady wrist without snagging sterile latex.',
      price: 3850,
      plateImg: 'assets/media/plate_platinum.png',
      handImg: 'assets/media/img_hand_silver_unsplash.jpg',
      handCaption: 'CLINICAL FIT — CHIAROSCURO PALMAR STUDY',
      setupAngle: 0,
      rimTint: 'rgba(242, 240, 235, 0.10)',
    },
    {
      id: 'titanium-axis',
      code: 'SPECIMEN // 02',
      title: 'TITANIUM AXIS',
      spec: 'Grade-5 Anatomic Alloy · Channel-Set Twin Diamond Axis',
      craftNote:
        'Engineered to autoclave tolerances for rapid gloved transitions and twenty-hour calls. A continuous vertical bridge bisects light across the knuckle like a hairline titanium osteotomy.',
      price: 2450,
      plateImg: 'assets/media/plate_channel.png',
      handImg: 'assets/media/img_hand_mono_pixabay.jpg',
      handCaption: 'CLINICAL FIT — MONOCHROME DORSAL STUDY',
      setupAngle: -6,
      rimTint: 'rgba(232, 218, 190, 0.11)',
    },
    {
      id: 'aurum-artery',
      code: 'SPECIMEN // 03',
      title: 'AURUM ARTERY',
      spec: '18K Sandblasted Surgical Gold · Recessed High-Bezel Crystal',
      craftNote:
        'Warm raw gold cast against crushed basalt mold sand, left unpolished along its interior bridge. Weighted toward the palm with zero-catch low-profile prongs.',
      price: 3400,
      plateImg: 'assets/media/plate_gold.png',
      handImg: 'assets/media/img_hand_gold_pixabay.jpg',
      handCaption: 'CLINICAL FIT — RESTING KNUCKLE ALIGNMENT',
      setupAngle: 4,
      rimTint: 'rgba(238, 210, 148, 0.11)',
    },
    {
      id: 'veridian-coronal',
      code: 'SPECIMEN // 04',
      title: 'VERIDIAN CORONAL',
      spec: 'Forged 950 Platinum · Stepped Emerald & Baguette Geometry',
      craftNote:
        'A cold monolith of platinum anchoring an operating-field green emerald flanked by stepped baguette planes. Sharp structural reliefs calibrated for quiet authority outside the OR.',
      price: 5200,
      plateImg: 'assets/media/plate_emerald.png',
      handImg: 'assets/media/img_hand_model_pixabay.jpg',
      handCaption: 'CLINICAL FIT — ARTICULAR EDITORIAL STUDY',
      setupAngle: -4,
      rimTint: 'rgba(145, 224, 178, 0.11)',
    },
  ];

  // Frame 1: Model on left, popular jewel on right.
  // Frames 2..4: Dark basalt/architectural single piece moving on left, hands/editorial model film on right.
  const frames = [
    {
      id: 'frame-1',
      productIndex: 0,
      left: {
        video: 'assets/media/vid_model_glamour_coverr.mp4',
        label: 'SUTURE NOIR — FILM',
        gradeClass: 'grade-noir',
        dimensional: false,
      },
      right: {
        video: 'assets/media/vid_obsidian_ring_pixabay.mp4',
        label: 'SUTURE NOIR',
        gradeClass: '',
        dimensional: false,
      },
    },
    {
      id: 'frame-2',
      productIndex: 1,
      left: {
        video: 'assets/media/vid_basalt_rings_mixkit.mp4',
        label: 'TITANIUM AXIS',
        gradeClass: 'grade-stone',
        dimensional: true,
      },
      right: {
        video: 'assets/media/vid_hand_ring_coverr.mp4',
        label: 'TITANIUM AXIS — FIT',
        gradeClass: 'grade-clinical',
        dimensional: false,
      },
    },
    {
      id: 'frame-3',
      productIndex: 2,
      left: {
        video: 'assets/media/vid_gold_stone_pixabay.mp4',
        label: 'AURUM ARTERY',
        gradeClass: 'grade-stone',
        dimensional: true,
      },
      right: {
        video: 'assets/media/vid_model_layered_coverr.mp4',
        label: 'AURUM ARTERY — EDIT',
        gradeClass: 'grade-noir',
        dimensional: false,
      },
    },
    {
      id: 'frame-4',
      productIndex: 3,
      left: {
        video: 'assets/media/vid_infinity_dark_pixabay.mp4',
        label: 'VERIDIAN CORONAL',
        gradeClass: '',
        dimensional: true,
      },
      right: {
        video: 'assets/media/vid_model_hoops_coverr.mp4',
        label: 'VERIDIAN CORONAL — MUSE',
        gradeClass: 'grade-noir',
        dimensional: false,
      },
    },
  ];

  const infoPages = {
    'customer-care': {
      title: 'CUSTOMER CARE',
      body:
        '<p>Every SKALA ring is calibrated to anatomical millimeter tolerances with snag-free interior bezels engineered for sterile glove compatibility and rapid hand-scrub discipline.</p>' +
        '<p>Private virtual sizing kits and surgical caliper fittings are dispatched worldwide within 48 hours of requisition. Complementary ultrasonic &amp; passivation servicing is available annually.</p>',
    },
    'about-us': {
      title: 'ABOUT US',
      body:
        '<p>SKALA builds brutalist fine jewelry exclusively for physicians, surgeons, residents, and practitioners whose hands operate under unrelenting stakes.</p>' +
        '<p>Stripped of ornament for its own sake, every silhouette is cast in obsidian-quenched platinum, grade-5 titanium, and brushed surgical gold — weighing stillness against movement.</p>',
    },
    'the-guild': {
      title: 'THE GUILD',
      body:
        '<p>Founded between Zurich, Berlin, and New York, The SKALA Guild connects master watch-case machinists with reconstructive specialists to refine tactile jewelry geometry.</p>' +
        '<p>Verified residency &amp; attending credentials unlock lifetime caliper resizing across career stages.</p>',
    },
    'legal-area': {
      title: 'LEGAL AREA',
      body:
        '<p>All SKALA alloys are independently assayed for hypoallergenic nickel-free medical compliance (ISO 5832-11 / ASTM F136 titanium &amp; 950 ruthenium-hardened platinum).</p>' +
        '<p>Specimen serial engravings are registered in perpetuity to the acquiring practitioner.</p>',
    },
    careers: {
      title: 'CAREERS',
      body:
        '<p>Seeking CAD horological prototypers, stone cutters specializing in flush channel architecture, and darkroom macro cinematographers.</p>' +
        '<p>Inquiries: guild@skala-specimens.example</p>',
    },
    social: {
      title: 'SOCIAL',
      body:
        '<p>Editorial dispatches, darkroom macro studies, and operating-room hand portraits.</p>' +
        '<p>IG // @SKALA.ARCHIVE &nbsp;&mdash;&nbsp; ARCHIVAL JOURNAL // ISSUE 06</p>',
    },
  };

  return { products, frames, infoPages };
})();
