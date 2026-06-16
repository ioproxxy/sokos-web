/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Ward {
  name: string;
  subCounty: string;
  lat: number;
  lon: number;
  desc: string;
}

export const NAIROBI_WARDS: Ward[] = [
  // Westlands Sub-County (5 Wards)
  { name: "Kitisuru Ward", subCounty: "Westlands", lat: -1.2285, lon: 36.7562, desc: "Kitisuru, Lake View & surrounding estates" },
  { name: "Parklands/Highridge Ward", subCounty: "Westlands", lat: -1.2587, lon: 36.8154, desc: "Parklands, Highridge & commercial strips" },
  { name: "Karura Ward", subCounty: "Westlands", lat: -1.2185, lon: 36.8285, desc: "Karura, Muthaiga, Gigiri & Runda" },
  { name: "Kangemi Ward", subCounty: "Westlands", lat: -1.2642, lon: 36.7454, desc: "Kangemi, Gichagi & surrounding local markets" },
  { name: "Mountain View Ward", subCounty: "Westlands", lat: -1.2573, lon: 36.7380, desc: "Mountain View, Thiongo & Kabete borders" },

  // Dagoretti North Sub-County (5 Wards)
  { name: "Kilimani Ward", subCounty: "Dagoretti North", lat: -1.2915, lon: 36.7900, desc: "Kilimani, Prestige, Yaya & Rose Avenue" },
  { name: "Kawangware Ward", subCounty: "Dagoretti North", lat: -1.2828, lon: 36.7389, desc: "Kawangware, Congo & Coast area trade hubs" },
  { name: "Gatina Ward", subCounty: "Dagoretti North", lat: -1.2645, lon: 36.7288, desc: "Gatina, Dagoretti corner markets and estates" },
  { name: "Kileleshwa Ward", subCounty: "Dagoretti North", lat: -1.2804, lon: 36.7915, desc: "Kileleshwa, Lavington & Riverside residences" },
  { name: "Kabiro Ward", subCounty: "Dagoretti North", lat: -1.2855, lon: 36.7550, desc: "Kabiro and surrounding residential estates" },

  // Dagoretti South Sub-County (5 Wards)
  { name: "Mutu-ini Ward", subCounty: "Dagoretti South", lat: -1.3142, lon: 36.6850, desc: "Mutu-ini & Dagoretti forest boundaries" },
  { name: "Ngando Ward", subCounty: "Dagoretti South", lat: -1.3090, lon: 36.7150, desc: "Ngando estate and Lenana school neighborhood" },
  { name: "Riruta Ward", subCounty: "Dagoretti South", lat: -1.2925, lon: 36.7320, desc: "Riruta Satellite & Dagoretti corner" },
  { name: "Uthiru/Ruthimitu Ward", subCounty: "Dagoretti South", lat: -1.2720, lon: 36.7200, desc: "Uthiru & Ruthimitu residential borders" },
  { name: "Waithaka Ward", subCounty: "Dagoretti South", lat: -1.2980, lon: 36.7080, desc: "Waithaka trade centers & local schools" },

  // Lang'ata Sub-County (5 Wards)
  { name: "Karen Ward", subCounty: "Lang'ata", lat: -1.3197, lon: 36.7142, desc: "Karen, Hardy & surrounding luxury estates" },
  { name: "Nairobi West Ward", subCounty: "Lang'ata", lat: -1.3090, lon: 36.8200, desc: "Nairobi West, Madaraka & Nyayo Stadium" },
  { name: "Mugumo-ini Ward", subCounty: "Lang'ata", lat: -1.3200, lon: 36.7950, desc: "Mugumo-ini & Langata police station area" },
  { name: "South C Ward", subCounty: "Lang'ata", lat: -1.3204, lon: 36.8267, desc: "South C, Bellevue & Mombasa Road trade hub" },
  { name: "Nyayo Highrise Ward", subCounty: "Lang'ata", lat: -1.3095, lon: 36.8050, desc: "Nyayo Highrise estates & Mbagathi residential hub" },

  // Kibra Sub-County (5 Wards)
  { name: "Laini Saba Ward", subCounty: "Kibra", lat: -1.3120, lon: 36.7960, desc: "Laini Saba & Kibera railway neighborhoods" },
  { name: "Lindi Ward", subCounty: "Kibra", lat: -1.3135, lon: 36.7900, desc: "Lindi, Kibera court houses & local kiosks" },
  { name: "Makina Ward", subCounty: "Kibra", lat: -1.3100, lon: 36.7860, desc: "Makina, Kibera mosque & primary clinics" },
  { name: "Woodley/Kenyatta Golf Course Ward", subCounty: "Kibra", lat: -1.3040, lon: 36.7820, desc: "Woodley estate & Ngong Road trade strip" },
  { name: "Sarang'ombe Ward", subCounty: "Kibra", lat: -1.3130, lon: 36.7795, desc: "Sarang'ombe & Olympic residential zones" },

  // Roysambu Sub-County (5 Wards)
  { name: "Githurai Ward", subCounty: "Roysambu", lat: -1.2057, lon: 36.9110, desc: "Githurai 44, Githurai 45 & railway market" },
  { name: "Kahawa West Ward", subCounty: "Roysambu", lat: -1.1852, lon: 36.8900, desc: "Kahawa West, Kamae & surrounding estates" },
  { name: "Zimmermann Ward", subCounty: "Roysambu", lat: -1.2135, lon: 36.8950, desc: "Zimmermann, Base & Kamiti Road strips" },
  { name: "Roysambu Ward", subCounty: "Roysambu", lat: -1.2183, lon: 36.8860, desc: "Roysambu, TRM, Lumumba Drive & Mirema" },
  { name: "Kahawa Ward", subCounty: "Roysambu", lat: -1.1830, lon: 36.9150, desc: "Kahawa Barracks, KU & Kahawa Sukari borders" },

  // Kasarani Sub-County (5 Wards)
  { name: "Clay City Ward", subCounty: "Kasarani", lat: -1.2155, lon: 36.9050, desc: "Clay Works, ICIPE & Thika Road zones" },
  { name: "Mwiki Ward", subCounty: "Kasarani", lat: -1.2290, lon: 36.9290, desc: "Mwiki retail shops & surrounding settlements" },
  { name: "Kasarani Ward", subCounty: "Kasarani", lat: -1.2215, lon: 36.8970, desc: "Kasarani, Sportsview, Seasons & Hunters" },
  { name: "Ruai Ward", subCounty: "Kasarani", lat: -1.2721, lon: 37.0142, desc: "Ruai town, bypass & sewage road neighborhoods" },
  { name: "Njiru Ward", subCounty: "Kasarani", lat: -1.2389, lon: 36.9610, desc: "Njiru, Chokaa & Kangundo Road trade spots" },

  // Ruaraka Sub-County (5 Wards)
  { name: "Babadogo Ward", subCounty: "Ruaraka", lat: -1.2425, lon: 36.8770, desc: "Babadogo industrial park & surrounding zones" },
  { name: "Utalii Ward", subCounty: "Ruaraka", lat: -1.2580, lon: 36.8580, desc: "Utalii, Kenya College & Mathare borders" },
  { name: "Mathare North Ward", subCounty: "Ruaraka", lat: -1.2520, lon: 36.8680, desc: "Mathare North, Area 1 & local market" },
  { name: "Lucky Summer Ward", subCounty: "Ruaraka", lat: -1.2315, lon: 36.8890, desc: "Lucky Summer estate & surrounding light industry" },
  { name: "Korogocho Ward", subCounty: "Ruaraka", lat: -1.2490, lon: 36.8920, desc: "Korogocho market place & adjacent quarters" },

  // Embakasi South Sub-County (5 Wards)
  { name: "Imara Daima Ward", subCounty: "Embakasi South", lat: -1.3280, lon: 36.8750, desc: "Imara Daima, AA & Muimara residential estates" },
  { name: "Kwa Njenga Ward", subCounty: "Embakasi South", lat: -1.3150, lon: 36.8830, desc: "Kwa Njenga, outering road & local shops" },
  { name: "Kwa Reuben Ward", subCounty: "Embakasi South", lat: -1.3110, lon: 36.8740, desc: "Kwa Reuben settlement and trade networks" },
  { name: "Pipeline Ward", subCounty: "Embakasi South", lat: -1.3180, lon: 36.8950, desc: "Pipeline, Plot 10 & densely populated developments" },
  { name: "Kware Ward", subCounty: "Embakasi South", lat: -1.3195, lon: 36.9010, desc: "Kware market & neighboring residential zones" },

  // Embakasi North Sub-County (5 Wards)
  { name: "Kariobangi North Ward", subCounty: "Embakasi North", lat: -1.2450, lon: 36.8840, desc: "Kariobangi North & Kamunde Road trade hubs" },
  { name: "Dandora Area I Ward", subCounty: "Embakasi North", lat: -1.2483, lon: 36.8967, desc: "Dandora Area I, local clinics & schools" },
  { name: "Dandora Area II Ward", subCounty: "Embakasi North", lat: -1.2484, lon: 36.9050, desc: "Dandora Area II & surrounding retail businesses" },
  { name: "Dandora Area III Ward", subCounty: "Embakasi North", lat: -1.2490, lon: 36.9110, desc: "Dandora Area III residential blocks" },
  { name: "Dandora Area IV Ward", subCounty: "Embakasi North", lat: -1.2510, lon: 36.9160, desc: "Dandora Area IV & garbage city border" },

  // Embakasi Central Sub-County (5 Wards)
  { name: "Kayole North Ward", subCounty: "Embakasi Central", lat: -1.2650, lon: 36.9320, desc: "Kayole North, B3 & surrounding estate kiosks" },
  { name: "Kayole Central Ward", subCounty: "Embakasi Central", lat: -1.2680, lon: 36.9405, desc: "Kayole Central, Spine Road commercial strip" },
  { name: "Kayole South Ward", subCounty: "Embakasi Central", lat: -1.2740, lon: 36.9510, desc: "Kayole South, local dispensaries & salons" },
  { name: "Komarock Ward", subCounty: "Embakasi Central", lat: -1.2612, lon: 36.9240, desc: "Komarock, Sector 1-4 & Komarock Mall" },
  { name: "Matopeni/Spring Valley Ward", subCounty: "Embakasi Central", lat: -1.2580, lon: 36.9450, desc: "Matopeni & Spring Valley borders" },

  // Embakasi East Sub-County (5 Wards)
  { name: "Upper Savanna Ward", subCounty: "Embakasi East", lat: -1.2850, lon: 36.8980, desc: "Donholm, Old Donholm & Greenfields" },
  { name: "Lower Savanna Ward", subCounty: "Embakasi East", lat: -1.2910, lon: 36.9080, desc: "Soweto, Lower Savanna & surrounding centers" },
  { name: "Embakasi Ward", subCounty: "Embakasi East", lat: -1.3200, lon: 36.9000, desc: "Embakasi Village, Nyayo Estate & Tassia" },
  { name: "Utawala Ward", subCounty: "Embakasi East", lat: -1.2954, lon: 36.9742, desc: "Utawala, Benedicta, GSU camp & bypass" },
  { name: "Mihang'o Ward", subCounty: "Embakasi East", lat: -1.2780, lon: 36.9620, desc: "Mihang'o area, quarries & AP post" },

  // Embakasi West Sub-County (4 Wards)
  { name: "Umoja I Ward", subCounty: "Embakasi West", lat: -1.2780, lon: 36.8940, desc: "Umoja I, innercore & local market zones" },
  { name: "Umoja II Ward", subCounty: "Embakasi West", lat: -1.2810, lon: 36.9025, desc: "Umoja II, Unity primary & surrounding lanes" },
  { name: "Mowlem Ward", subCounty: "Embakasi West", lat: -1.2590, lon: 36.9010, desc: "Mowlem, Kangundo road rail boundary" },
  { name: "Kariobangi South Ward", subCounty: "Embakasi West", lat: -1.2585, lon: 36.8835, desc: "Kariobangi South, Civil Servants & outer ring" },

  // Makadara Sub-County (4 Wards)
  { name: "Maringo/Hamza Ward", subCounty: "Makadara", lat: -1.2880, lon: 36.8680, desc: "Maringo, Hamza & Jogoo Road residences" },
  { name: "Viwandani Ward", subCounty: "Makadara", lat: -1.3050, lon: 36.8650, desc: "Viwandani industrial layouts & worker lines" },
  { name: "Harambee Ward", subCounty: "Makadara", lat: -1.2830, lon: 36.8620, desc: "Harambee estate, Metropolitan hospital area" },
  { name: "Makongeni Ward", subCounty: "Makadara", lat: -1.2860, lon: 36.8480, desc: "Makongeni, Kaloleni & Jogoo Road rails" },

  // Kamukunji Sub-County (5 Wards)
  { name: "Pumwani Ward", subCounty: "Kamukunji", lat: -1.2750, lon: 36.8400, desc: "Pumwani, Gikomba & local maternity area" },
  { name: "Eastleigh North Ward", subCounty: "Kamukunji", lat: -1.2710, lon: 36.8520, desc: "Eastleigh Section III & Section I business hubs" },
  { name: "Eastleigh South Ward", subCounty: "Kamukunji", lat: -1.2770, lon: 36.8500, desc: "Eastleigh South garment malls & hotels" },
  { name: "Airbase Ward", subCounty: "Kamukunji", lat: -1.2690, lon: 36.8660, desc: "Airbase estate & Moi Air Base borders" },
  { name: "California Ward", subCounty: "Kamukunji", lat: -1.2740, lon: 36.8440, desc: "California residential blocks & local parks" },

  // Starehe Sub-County (6 Wards)
  { name: "Nairobi Central Ward", subCounty: "Starehe", lat: -1.2833, lon: 36.8219, desc: "Nairobi CBD, City Hall, & central retail" },
  { name: "Ngara Ward", subCounty: "Starehe", lat: -1.2740, lon: 36.8260, desc: "Ngara market, Fig Tree & railway quarters" },
  { name: "Pangani Ward", subCounty: "Starehe", lat: -1.2670, lon: 36.8420, desc: "Pangani, Juja road & flyovers" },
  { name: "Ziwani/Kariokor Ward", subCounty: "Starehe", lat: -1.2760, lon: 36.8340, desc: "Ziwani residential & Kariokor market" },
  { name: "Landimawe Ward", subCounty: "Starehe", lat: -1.2950, lon: 36.8280, desc: "Landimawe & Industrial Area boundaries" },
  { name: "Nairobi South Ward", subCounty: "Starehe", lat: -1.3040, lon: 36.8320, desc: "South B, Hazina & Plainsview estates" },

  // Mathare Sub-County (6 Wards)
  { name: "Hospital Ward", subCounty: "Mathare", lat: -1.2610, lon: 36.8460, desc: "Hospital area & Mathare mental facility surroundings" },
  { name: "Mabatini Ward", subCounty: "Mathare", lat: -1.2590, lon: 36.8490, desc: "Mabatini, local clinics & adjacent rows" },
  { name: "Huruma Ward", subCounty: "Mathare", lat: -1.2560, lon: 36.8630, desc: "Huruma town, flats & central flyover" },
  { name: "Ngei Ward", subCounty: "Mathare", lat: -1.2530, lon: 36.8550, desc: "Ngei, local primary & private dispensaries" },
  { name: "Kiamaiko Ward", subCounty: "Mathare", lat: -1.2480, lon: 36.8720, desc: "Kiamaiko goat market & surrounding trade stalls" },
  { name: "Mlango Kubwa Ward", subCounty: "Mathare", lat: -1.2650, lon: 36.8390, desc: "Mlango Kubwa, Juja Road & Mathare slums border" },
];
