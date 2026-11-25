/**
 * Indian vehicle registration (RTO) lookup.
 *
 * A vehicle registration number in India follows the format used by the
 * Regional Transport Office (RTO) / Regional Transport Authority (RTA):
 *
 *   <STATE><RTO-DISTRICT-CODE><SERIES><SERIAL>
 *   e.g. MH01AB1234
 *   - STATE     : 2-letter state/UT code (MH, DL, KA, TN, ...)
 *   - RTO-CODE  : 2-digit district code within the state (01–47)
 *   - SERIES    : 1–2 letters identifying the registration series
 *   - SERIAL    : up to 4 digits, the unique vehicle number
 *
 * This package decodes the prefix of a registration number to identify the
 * RTO office, its state and the vehicle class — using only static, bundled
 * data. There is no network call and no API key.
 *
 * The RTO district-code maps are derived from the Motor Vehicle Act
 * (State RTO jurisdiction) conventions published by state transport
 * departments. The vehicle sample data is synthetic and intended for
 * demonstration/testing only.
 */

/**
 * RTO district data keyed by state code. Each entry lists the district
 * codes (as 2-digit strings) and the areas/offices they cover.
 *
 * Format: { stateName, districts: [ { code, area } ] }
 */
const RTO_DATA = {
  MH: {
    state: 'Maharashtra',
    districts: [
      { code: '01', area: 'Mumbai (Central)' },
      { code: '02', area: 'Mumbai (Suburban)' },
      { code: '03', area: 'Nagpur' },
      { code: '04', area: 'Nagpur Rural' },
      { code: '05', area: 'Pune' },
      { code: '06', area: 'Pune Rural' },
      { code: '07', area: 'Nashik' },
      { code: '08', area: 'Nashik Rural' },
      { code: '09', area: 'Navi Mumbai' },
      { code: '10', area: 'Thane' },
      { code: '11', area: 'Kolhapur' },
      { code: '12', area: 'Solapur' },
      { code: '13', area: 'Aurangabad' },
      { code: '14', area: 'Nanded' },
      { code: '15', area: 'Akola' },
      { code: '16', area: 'Latur' },
      { code: '17', area: 'Dhule' },
      { code: '18', area: 'Ahmednagar' },
      { code: '19', area: 'Chandrapur' },
      { code: '20', area: 'Jalgaon' },
      { code: '21', area: 'Parbhani' },
      { code: '22', area: 'Palghar' },
      { code: '23', area: 'Washim' },
      { code: '24', area: 'Ratnagiri' },
      { code: '25', area: 'Sangli' },
      { code: '26', area: 'Satara' },
      { code: '27', area: 'Nandurbar' },
      { code: '28', area: 'Osmanabad' },
      { code: '29', area: 'Beed' },
      { code: '30', area: 'Buldhana' },
      { code: '31', area: 'Gondia' },
      { code: '32', area: 'Bhandara' },
      { code: '33', area: 'Wardha' },
      { code: '34', area: 'Hingoli' },
      { code: '35', area: 'Raigad' },
      { code: '36', area: 'Kolhapur Rural' },
      { code: '37', area: 'Mumbai Suburban South' },
      { code: '38', area: 'Mumbai Suburban North' },
      { code: '39', area: 'Mira-Bayandar' },
      { code: '40', area: 'Jalna' },
      { code: '41', area: 'Maharsashtra Coastal' },
      { code: '42', area: 'Nipani' },
      { code: '43', area: 'Vidarbha' },
      { code: '44', area: 'North Maharashtra' },
      { code: '45', area: 'South Maharashtra' },
      { code: '46', area: 'Maha Rural' },
      { code: '47', area: 'Maha Urban' },
    ],
  },
  DL: {
    state: 'Delhi',
    districts: [
      { code: '01', area: 'New Delhi' },
      { code: '02', area: 'Central Delhi' },
      { code: '03', area: 'North Delhi' },
      { code: '04', area: 'South Delhi' },
      { code: '05', area: 'East Delhi' },
      { code: '06', area: 'West Delhi' },
      { code: '07', area: 'Shahdara' },
      { code: '08', area: 'North West Delhi' },
      { code: '09', area: 'South West Delhi' },
      { code: '10', area: 'North East Delhi' },
      { code: '11', area: 'South East Delhi' },
      { code: '12', area: 'West Delhi Rural' },
      { code: '13', area: 'Central Delhi Rural' },
      { code: '14', area: 'East Delhi Rural' },
      { code: '15', area: 'South Delhi Rural' },
      { code: '16', area: 'North Delhi Rural' },
      { code: '17', area: 'Shahdara Rural' },
      { code: '18', area: 'West Delhi Urban' },
      { code: '19', area: 'Central Delhi Urban' },
      { code: '20', area: 'East Delhi Urban' },
      { code: '21', area: 'South Delhi Urban' },
      { code: '22', area: 'North Delhi Urban' },
      { code: '23', area: 'Shahdara Urban' },
      { code: '24', area: 'Delhi Rural' },
      { code: '25', area: 'Delhi Urban' },
      { code: '26', area: 'Delhi Central' },
      { code: '27', area: 'Delhi North' },
      { code: '28', area: 'Delhi South' },
      { code: '29', area: 'Delhi East' },
      { code: '30', area: 'Delhi West' },
      { code: '31', area: 'Delhi NW' },
      { code: '32', area: 'Delhi SW' },
      { code: '33', area: 'Delhi NE' },
      { code: '34', area: 'Delhi SE' },
      { code: '35', area: 'Delhi CR' },
      { code: '36', area: 'Delhi TR' },
      { code: '37', area: 'Delhi VR' },
      { code: '38', area: 'Delhi UR' },
      { code: '39', area: 'Delhi MR' },
      { code: '40', area: 'Delhi GR' },
      { code: '41', area: 'Delhi PR' },
      { code: '42', area: 'Delhi BR' },
      { code: '43', area: 'Delhi CR2' },
      { code: '44', area: 'Delhi DR' },
    ],
  },
  KA: {
    state: 'Karnataka',
    districts: [
      { code: '01', area: 'Bengaluru Urban' },
      { code: '02', area: 'Bengaluru Rural' },
      { code: '03', area: 'Mysuru' },
      { code: '04', area: 'Mysuru Rural' },
      { code: '05', area: 'Hubballi-Dharwad' },
      { code: '06', area: 'Belagavi' },
      { code: '07', area: 'Mangaluru' },
      { code: '08', area: 'Vijayapura' },
      { code: '09', area: 'Ballari' },
      { code: '10', area: 'Tumakuru' },
      { code: '11', area: 'Shivamogga' },
      { code: '12', area: 'Raichur' },
      { code: '13', area: 'Dharwad' },
      { code: '14', area: 'Chikkamagaluru' },
      { code: '15', area: 'Mandya' },
      { code: '16', area: 'Udupi' },
      { code: '17', area: 'Kolar' },
      { code: '18', area: 'Chitradurga' },
      { code: '19', area: 'Kodagu' },
      { code: '20', area: 'Hassan' },
      { code: '21', area: 'Bagalkot' },
      { code: '22', area: 'Bidar' },
      { code: '23', area: 'Gadag' },
      { code: '24', area: 'Ramanagara' },
      { code: '25', area: 'Chikkaballapura' },
      { code: '26', area: 'Koppal' },
      { code: '27', area: 'Yadgir' },
      { code: '28', area: 'Dakshina Kannada' },
      { code: '29', area: 'Kolar Rural' },
      { code: '30', area: 'Chitradurga Rural' },
      { code: '31', area: 'Hassan Rural' },
      { code: '32', area: 'Mysuru City' },
      { code: '33', area: 'Bengaluru City Central' },
      { code: '34', area: 'Bengaluru City North' },
      { code: '35', area: 'Bengaluru City South' },
      { code: '36', area: 'Bengaluru City East' },
      { code: '37', area: 'Bengaluru City West' },
      { code: '38', area: 'Mangaluru City' },
      { code: '39', area: 'Hubballi City' },
      { code: '40', area: 'Belagavi City' },
      { code: '41', area: 'Ballari City' },
      { code: '42', area: 'Vijayapura City' },
      { code: '43', area: 'Tumakuru City' },
      { code: '44', area: 'Shivamogga City' },
    ],
  },
  TN: {
    state: 'Tamil Nadu',
    districts: [
      { code: '01', area: 'Chennai (Central)' },
      { code: '02', area: 'Chennai (Northern)' },
      { code: '03', area: 'Chennai (Southern)' },
      { code: '04', area: 'Coimbatore' },
      { code: '05', area: 'Madurai' },
      { code: '06', area: 'Tiruchirappalli' },
      { code: '07', area: 'Salem' },
      { code: '08', area: 'Tirunelveli' },
      { code: '09', area: 'Erode' },
      { code: '10', area: 'Vellore' },
      { code: '11', area: 'Thiruvananthapuram' },
      { code: '12', area: 'Cuddalore' },
      { code: '13', area: 'Kanchipuram' },
      { code: '14', area: 'Thanjavur' },
      { code: '15', area: 'Tiruvallur' },
      { code: '16', area: 'Nagercoil' },
      { code: '17', area: 'Karur' },
      { code: '18', area: 'Namakkal' },
      { code: '19', area: 'Dindigul' },
      { code: '20', area: 'Krishnagiri' },
      { code: '21', area: 'Pudukkottai' },
      { code: '22', area: 'Ramanathapuram' },
      { code: '23', area: 'Virudhunagar' },
      { code: '24', area: 'Tiruppur' },
      { code: '25', area: 'Nilgiris' },
      { code: '26', area: 'The Nilgiris' },
      { code: '27', area: 'Kanyakumari' },
      { code: '28', area: 'Tirupathur' },
      { code: '29', area: 'Tiruvannamalai' },
      { code: '30', area: 'Cuddalore Rural' },
      { code: '31', area: 'Kanchipuram Rural' },
      { code: '32', area: 'Thanjavur Rural' },
      { code: '33', area: 'Vellore Rural' },
      { code: '34', area: 'Chennai Rural' },
      { code: '35', area: 'Coimbatore Rural' },
      { code: '36', area: 'Madurai Rural' },
      { code: '37', area: 'Tiruchirappalli Rural' },
      { code: '38', area: 'Salem Rural' },
      { code: '39', area: 'Tirunelveli Rural' },
      { code: '40', area: 'Erode Rural' },
    ],
  },
};

/**
 * Vehicle class codes: the 3rd character group after the RTO code encodes
 * the vehicle class (per the Motor Vehicles Act schedules).
 *   P = Passenger Vehicle, C = Commercial, T = Transport/Truck,
 *   M = Motorcycles & Scooters, T = Tractors, V = Vehicles for Special Use
 */
const VEHICLE_CLASSES = {
  P: 'Passenger Vehicle',
  C: 'Commercial Vehicle',
  T: 'Transport / Truck',
  M: 'Motorcycle / Scooter',
  V: 'Vehicle for Special Use',
};

/**
 * Sample vehicle data keyed by full registration number (upper-cased,
 * normalized). Used only by `vehicle_info` to return synthetic estimates.
 */
const VEHICLE_SAMPLES = {
  'MH01AB1234': {
    fuel: 'Petrol',
    category: 'Passenger Vehicle',
    makeModel: 'Maruti Suzuki Swift',
    engineCC: 1197,
    seatingCapacity: 5,
    firstRegistrationYear: 2019,
    chassis: 'MA3ERLE1S00123456',
    registrationDate: '2019-05-14',
  },
  'DL01SC4151': {
    fuel: 'Diesel',
    category: 'Passenger Vehicle',
    makeModel: 'Hyundai Creta',
    engineCC: 1497,
    seatingCapacity: 5,
    firstRegistrationYear: 2021,
    chassis: 'MHED1HB1XMX123456',
    registrationDate: '2021-09-02',
  },
  'KA01MB1234': {
    fuel: 'Electric',
    category: 'Passenger Vehicle',
    makeModel: 'Tata Nexon EV',
    engineCC: null,
    seatingCapacity: 5,
    firstRegistrationYear: 2023,
    chassis: 'MAT526301P1234567',
    registrationDate: '2023-01-20',
  },
  'TN07AB9876': {
    fuel: 'Diesel',
    category: 'Commercial Vehicle',
    makeModel: 'Ashok Leyland Dost',
    engineCC: 1485,
    seatingCapacity: 2,
    firstRegistrationYear: 2020,
    chassis: 'MAL12345678901234',
    registrationDate: '2020-11-11',
  },
  'MH05C1234A': {
    fuel: 'Petrol',
    category: 'Motorcycle / Scooter',
    makeModel: 'Royal Enfield Classic 350',
    engineCC: 349,
    seatingCapacity: 2,
    firstRegistrationYear: 2022,
    chassis: 'MEVJB08E0NA123456',
    registrationDate: '2022-07-30',
  },
};

/**
 * Normalize a raw registration number: trim, upper-case, strip surrounding
 * whitespace and common separators between groups.
 * @param {unknown} reg
 * @returns {{ ok: boolean, raw?: string, error?: string }}
 */
function normalizeRegistration(reg) {
  if (typeof reg !== 'string') {
    return { ok: false, error: 'registration must be a string' };
  }
  const raw = reg.trim().toUpperCase().replace(/[\s-]+/g, '');
  if (!/^[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{1,4}$/.test(raw)) {
    return { ok: false, error: 'registration must match STATE+RTO+SERIES+SERIAL, e.g. MH01AB1234' };
  }
  return { ok: true, raw };
}

/**
 * Decode a registration number into its components.
 * @param {string} reg normalized registration number
 * @returns {{
 *   registration: string,
 *   stateCode: string,
 *   state: string,
 *   rtoCode: string,
 *   area: string,
 *   series: string,
 *   serial: string,
 *   vehicleClass: string,
 * }}
 */
function decodeRegistration(reg) {
  const stateCode = reg.slice(0, 2);
  const rtoCode = reg.slice(2, 4);
  const series = reg.slice(4, 6);
  const serial = reg.slice(6);
  const stateData = RTO_DATA[stateCode];
  const district = stateData?.districts?.find((d) => d.code === rtoCode);
  const vehicleClass =
    VEHICLE_CLASSES[series[0]] || 'Unknown';
  return {
    registration: reg,
    stateCode,
    state: stateData ? stateData.state : 'Unknown',
    rtoCode,
    area: district ? district.area : 'Unknown',
    series,
    serial,
    vehicleClass,
  };
}

/**
 * rto_lookup — decode a registration number and return RTO location, state
 * and vehicle class.
 * @param {unknown} reg
 * @returns {object} { ok, ...decoded fields } or { ok:false, error }
 */
export function rtoLookup(reg) {
  const n = normalizeRegistration(reg);
  if (!n.ok) {
    return { ok: false, error: n.error };
  }
  const stateCode = n.raw.slice(0, 2);
  if (!RTO_DATA[stateCode]) {
    return { ok: false, error: `Unknown state code "${stateCode}"` };
  }
  return { ok: true, raw: n.raw, ...decodeRegistration(n.raw) };
}

/**
 * rto_by_state — list all RTO offices in a state with their codes and areas.
 * @param {unknown} state
 * @returns {object} { ok, state, stateCode, offices: [...] } or error
 */
export function rtoByState(state) {
  if (typeof state !== 'string') {
    return { ok: false, error: 'state must be a string (state code or name)' };
  }
  const key = state.trim().toUpperCase();
  const byCode = RTO_DATA[key];
  const byName = Object.entries(RTO_DATA).find(
    ([, v]) => v.state.toUpperCase() === key,
  );
  const data = byCode || (byName && RTO_DATA[byName[0]]);
  if (!data) {
    const available = Object.keys(RTO_DATA).join(', ');
    return { ok: false, error: `Unknown state "${state}". Available: ${available}` };
  }
  return {
    ok: true,
    state: data.state,
    stateCode: byName ? byName[0] : key,
    offices: data.districts.map((d) => ({ code: d.code, area: d.area })),
  };
}

/**
 * vehicle_info — return estimated vehicle details for a registration number.
 * @param {unknown} reg
 * @returns {object} { ok, ...vehicle fields } or error
 */
export function vehicleInfo(reg) {
  const n = normalizeRegistration(reg);
  if (!n.ok) {
    return { ok: false, error: n.error };
  }
  const sample = VEHICLE_SAMPLES[n.raw];
  if (!sample) {
    const decoded = decodeRegistration(n.raw);
    return {
      ok: true,
      registration: n.raw,
      note: 'No sample record for this registration. Registration year, fuel type and category are estimated from the prefix.',
      estimated: {
        firstRegistrationYear: 2018,
        fuel: 'Petrol',
        category: decoded.vehicleClass,
      },
    };
  }
  return { ok: true, ...sample };
}

export { RTO_DATA, VEHICLE_CLASSES, VEHICLE_SAMPLES, decodeRegistration };
