export const CATS = {
  Foundation: "#7F77DD",
  Structure: "#1D9E75",
  Exterior: "#D85A30",
  Interior: "#BA7517",
  Systems: "#185FA5",
  Packages: "#993556",
  Finishing: "#639922",
  Checkout: "#5F5E5A",
};

export interface Option {
  label: string;
  detail?: string;
  price: string;
  note?: string;
}

export interface Rule {
  type: "critical" | "info";
  text: string;
}

export interface Step {
  id: string;
  num: string;
  title: string;
  tag: keyof typeof CATS;
  description: string;
  options: Option[];
  rules: Rule[];
  threeD: string[];
  ux: string[];
}

export const HEIGHT_OPTIONS: Option[] = [
  { label: "Standard (79\" interior)", detail: "6'7\" clearance · Overall ~7'0\"", price: "Included", note: "" },
  { label: "+6\" (7'0\" interior)", detail: "7'0\" clearance · Overall ~7'6\"", price: "$16/LFT", note: "" },
  { label: "+12\" (7'6\" interior)", detail: "7'6\" clearance · Overall ~8'0\"", price: "$31/LFT", note: "" },
  { label: "+18\" (8'0\" interior)", detail: "8'0\" clearance · Overall ~8'6\"", price: "$41/LFT", note: "⚠ Super Duty Ramp" },
  { label: "+24\" (8'6\" interior)", detail: "8'6\" clearance · Overall ~9'0\"", price: "$55/LFT", note: "⚠ Ramp + Winch" },
];

export const STEPS: Step[] = [
  {
    id: "foundation", num: "01", title: "Choose Your Size", tag: "Foundation",
    description: "Trailer length is the root variable — it sets the base price, frame type, axle baseline, and every downstream upgrade path.",
    options: [
      { label: "8.5 × 18 ft", detail: "6\" frame · 3500 lb base axle · +2 ft = +$210", price: "$8,465", note: "Compact" },
      { label: "8.5 × 20 ft", detail: "6\" frame · 3500 lb base axle · +2 ft = +$195", price: "$8,675", note: "" },
      { label: "8.5 × 22 ft", detail: "6\" frame · 3500 lb base axle · +2 ft = +$200", price: "$8,870", note: "" },
      { label: "8.5 × 24 ft", detail: "6\" frame · 3500 lb base axle · +2 ft = +$2,470 (class jump)", price: "$9,070", note: "Best Seller" },
      { label: "8.5 × 26 ft", detail: "8\" frame · 5200 lb base axle ✦ · +2 ft = +$270", price: "$11,340", note: "Heavy Class" },
      { label: "8.5 × 28 ft", detail: "8\" frame · 5200 lb base axle ✦ · +2 ft = +$445", price: "$11,610", note: "" },
      { label: "8.5 × 30 ft", detail: "8\" frame · 5200 lb base axle ✦ · +2 ft = +$405", price: "$12,055", note: "" },
      { label: "8.5 × 32 ft", detail: "8\" frame · 5200 lb base axle ✦ · +2 ft = +$1,545", price: "$12,460", note: "" },
      { label: "8.5 × 34 ft", detail: "8\" frame · Triple axle standard ✦", price: "$14,005", note: "Flagship" },
    ],
    rules: [
      { type: "critical", text: "18–24 ft: 6\" main frame, 3500 lb tandem base axle." },
      { type: "critical", text: "26–34 ft: 8\" main frame is ALREADY in base price. Base axle is 5200 lb." },
      { type: "critical", text: "34 ft ships as TA3 Triple Torsion standard — never a tandem build." }
    ],
    threeD: ["Trailer body scales horizontally as length is selected."],
    ux: ["Show length + usable cargo space side by side."],
  },
  {
    id: "nose", num: "02", title: "Front Style", tag: "Exterior",
    description: "V-nose and flat front are genuinely different buyer identities.",
    options: [
      { label: "V-Nose w/ ATP Diamond Plate", detail: "Standard tapered front — adds ~3 ft of nose storage space", price: "Included", note: "" },
      { label: "Flat Front w/ Rounded ATP Corners", detail: "Maximum cargo length, anodized aluminum corner caps", price: "+$68", note: "Race Flex" },
    ],
    rules: [
      { type: "info", text: "V-nose adds ~3 ft of storage but reduces usable flat cargo floor." }
    ],
    threeD: ["Flat front: squared-off front with polished rounded ATP corner caps."],
    ux: ["Label them: 'V-Nose — Classic' and 'Flat Front — Race Style'."],
  },
  {
    id: "suspension", num: "03", title: "Suspension & Axles", tag: "Structure",
    description: "Axle selection is a load, ride, and style decision.",
    options: [
      { label: "Standard 3500 lb Leaf Spring", detail: "Base tandem included", price: "Included", note: "" },
      { label: "3500 lb Torsion", detail: "Smoother ride, independent suspension", price: "+$575", note: "" },
      { label: "5200 lb Drop Spring", detail: "Higher capacity + triple tongue", price: "+$875", note: "" },
      { label: "5200 lb Torsion", detail: "Best ride + higher capacity", price: "+$1,080", note: "Popular" },
      { label: "7000 lb Torsion", detail: "Race standard", price: "+$1,755", note: "Race Choice" },
      { label: "+ Spread Axle — Tandem", detail: "Wider stance, better stability", price: "+$338", note: "Torsion required" },
    ],
    rules: [
      { type: "critical", text: "Spread axles require torsion suspension." }
    ],
    threeD: ["Show axle count visually — tandem = 2 axles, triple = 3 axles."],
    ux: ["Spread axle as a 'stance upgrade' card."],
  },
  {
    id: "exterior", num: "04", title: "Exterior Finish", tag: "Exterior",
    description: "Semi-screwless exterior is standard on ALL Toy Trailers.",
    options: [
      { label: "Semi-Screwless", detail: "Concealed fasteners on major panels", price: "Included", note: "All builds" },
      { label: "Full Screwless Exterior Upgrade", detail: "Every single fastener concealed", price: "+$27/LFT", note: "Premium" },
      { label: "Blackout Package", detail: "Black trim, noseguard, fenders", price: "+$18/LFT", note: "Popular" },
      { label: "Standard Color: Matte Black", detail: "", price: "Included", note: "" },
      { label: "Standard Color: Arctic White", detail: "", price: "Included", note: "" },
      { label: "Standard Color: Charcoal", detail: "", price: "Included", note: "" },
    ],
    rules: [
      { type: "info", text: "Blackout Package and ATP Sides can be combined." }
    ],
    threeD: ["Color swap is the hero moment — instant full-body color change."],
    ux: ["Color wheel: 10 standard free, 8 premium options."],
  },
  {
    id: "doors", num: "05", title: "Doors & Access", tag: "Exterior",
    description: "Rear door config determines how cargo loads. Side door placement affects workflow.",
    options: [
      { label: "Heavy Duty Ramp", detail: "4,500 lb capacity — standard", price: "Included", note: "" },
      { label: "Super Duty Ramp Upgrade", detail: "7,000 lb capacity", price: "+$745", note: "⚠ Auto at +18\"" },
      { label: "Double Barn Doors", detail: "Removes ramp and beavertail", price: "$0 swap", note: "⚠ Removes beavertail" },
      { label: "Upgrade to 48\" Side Door", detail: "Wider pass-through", price: "+$120", note: "Popular" },
    ],
    rules: [
      { type: "critical", text: "Super Duty Ramp is MANDATORY at +18\" height or above." }
    ],
    threeD: ["Ramp door opening animation."],
    ux: ["Group: 'Rear Access', 'Side Access', 'Specialty'."],
  },
  {
    id: "windows", num: "06", title: "Windows", tag: "Exterior",
    description: "Window placement is a location and size decision.",
    options: [
      { label: "No Windows", detail: "Clean exterior", price: "Included", note: "" },
      { label: "15\"W × 30\"T", detail: "Small tinted", price: "+$305 each", note: "" },
      { label: "30\"W × 30\"T", detail: "Standard tinted", price: "+$335 each", note: "Most Popular" },
    ],
    rules: [
      { type: "info", text: "Window placement is customer-specified by zone." }
    ],
    threeD: ["Four placement zones: Driver Side, Passenger Side, Front, Rear."],
    ux: ["Zone selector with large icon cards."],
  },
  {
    id: "interior", num: "07", title: "Interior Finish", tag: "Interior",
    description: "Floor, wall, and ceiling material defines the trailer's character.",
    options: [
      { label: "Standard Floor (3/4\" Plywood)", price: "Included" },
      { label: "ATP/RTP/Coin Floor", detail: "Over plywood", price: "+$35/LFT", note: "Race / Contractor" },
      { label: "Aluminum Interior Walls", detail: "White metal", price: "+$38/LFT", note: "Race / LQ" },
      { label: "Wall Insulation", detail: "Thermal + acoustic batting", price: "+$23/LFT", note: "Recommended w/ AC" },
    ],
    rules: [
      { type: "info", text: "Always recommend insulation when AC is selected." }
    ],
    threeD: ["Interior camera mode toggle."],
    ux: ["Sub-sections: Floor, Walls, Ceiling, Insulation."],
  },
  {
    id: "electrical", num: "08", title: "Electrical", tag: "Systems",
    description: "Lead with packages — most buyers don't want to think in circuits.",
    options: [
      { label: "No Electrical", price: "Included" },
      { label: "110v 50 AMP Package (8-space)", price: "+$565", note: "Standard" },
      { label: "110v 50 AMP Package (12-space)", price: "+$700", note: "For AC / Bath" },
      { label: "12v Electrical Package", price: "+$700" },
    ],
    rules: [
      { type: "critical", text: "A/C units require 110v package." }
    ],
    threeD: ["Interior lights visually turn on."],
    ux: ["Lead with 'Choose a package', then 'Add individual items'."],
  },
  {
    id: "climate", num: "09", title: "Climate Control", tag: "Systems",
    description: "Help buyers size correctly based on trailer length.",
    options: [
      { label: "No Climate Control", price: "Included" },
      { label: "13,000 BTU A/C + Heat Strip", price: "+$1,485", note: "Shorter builds" },
      { label: "15,000 BTU A/C + Heat Strip", price: "+$1,755", note: "Longer builds" },
      { label: "Mini Split 13K BTU", price: "+$1,890" },
    ],
    rules: [
      { type: "critical", text: "All AC units require 110v electrical package." }
    ],
    threeD: ["Rooftop AC: visible exterior element."],
    ux: ["BTU recommendation card based on length."],
  },
  {
    id: "cargo", num: "10", title: "Cargo & Tie-Downs", tag: "Interior",
    description: "E-track and D-ring placement is a layout decision.",
    options: [
      { label: "Standard D-Rings (4 included)", price: "Included" },
      { label: "Wall E-Track", price: "+$11/LFT" },
      { label: "Floor E-Track + Steel Backer", price: "+$14/LFT" },
    ],
    rules: [
      { type: "info", text: "Standard trailer includes (4) 6000 lb floor D-rings." }
    ],
    threeD: ["E-track: aluminum track mounted horizontally along the wall."],
    ux: ["Lead with: 'What are you securing?'"],
  },
  {
    id: "storage", num: "11", title: "Cabinets & Storage", tag: "Interior",
    description: "Factory-installed cabinetry is built into the framing.",
    options: [
      { label: "V-Nose Base Cabinets", price: "+$878", note: "V-nose only" },
      { label: "V-Nose Overhead Cabinets", price: "+$945", note: "V-nose only" },
      { label: "Base Cabinets — wall run", price: "+$115/LFT" },
    ],
    rules: [
      { type: "info", text: "V-nose front cabinets only if V-nose was selected." }
    ],
    threeD: ["V-nose cabinets transform front section into workstation."],
    ux: ["Top-down floor plan at this step."],
  },
  {
    id: "specialty", num: "12", title: "Specialty Packages", tag: "Packages",
    description: "Complete solutions for specific buyer types.",
    options: [
      { label: "Race Package", detail: "The works for racers", price: "+$5,670", note: "Most Popular" },
      { label: "Full Bathroom Package", price: "+$5,195", note: "⚠ All prereqs" },
      { label: "Electric Awning 20 ft", price: "+$1,955" },
    ],
    rules: [
      { type: "critical", text: "Race Package includes 7000 lb torsion axles + Blackout Trim." }
    ],
    threeD: ["Race Package reveal: CINEMATIC HERO MOMENT."],
    ux: ["Hero card at the TOP — visual checklist."],
  },
  {
    id: "wheels", num: "13", title: "Wheels & Finishing", tag: "Finishing",
    description: "Aluminum wheels are the last visual upgrade.",
    options: [
      { label: "Standard Black Steel Wheels", price: "Included" },
      { label: "Aluminum Radial — 5200 lb Tandem", price: "+$675" },
      { label: "Aluminum Radial — 7000 lb Tandem", price: "+$810", note: "Recommended" },
    ],
    rules: [
      { type: "info", text: "Aluminum wheel pricing is per-axle-rating." }
    ],
    threeD: ["Wheel swap is instantly visible."],
    ux: ["Side-by-side image selector."],
  },
  {
    id: "summary", num: "14", title: "Your Build Summary", tag: "Checkout",
    description: "The close. Complete spec, total retail price.",
    options: [],
    rules: [
      { type: "critical", text: "Dependency validation before showing final price." }
    ],
    threeD: ["Final 360° cinematic orbit — hero angles."],
    ux: ["Three CTAs: 'Talk to a Specialist', 'Save Build', 'Order'."],
  },
];
