
export const stops = [
    { id: "jind", name: "Jind", lat: 29.315443268258544,lng: 76.35853789389431},
    { id: "alewa", name: "Alewa", lat: 29.46523211714413, lng: 76.45393872696319},
    { id: "assandh", name: "Assandh", lat: 29.524, lng: 76.607 },
    { id: "karnal", name: "Karnal", lat: 29.685, lng: 76.990 },
    { id: "indri", name: "Indri", lat: 29.879, lng: 77.060 },
    { id: "ladwa", name: "Ladwa", lat: 29.999, lng: 77.045 },
    { id: "yamunanagar", name: "Yamunanagar", lat: 30.129, lng: 77.267 },
    { id: "paonta", name: "Paonta Sahib", lat: 30.439, lng: 77.624 },
];

export const routes = [
    {
        id: "jind-paonta",
        name: "Jind – Paonta Sahib",
        via: "Via Alewa, Karnal, Indri & Yamunanagar",
        stopIds: [
            "jind",
            "alewa",
            "assandh",
            "karnal",
            "indri",
            "ladwa",
            "yamunanagar",
            "paonta",
        ],
        trips: [
            {
                id: "demo-trip-1",
                busNumber: "HR56GV8158",
                departure: "05:40 AM",
                status: "Demo schedule",
                times: [
                    "05:40 AM",
                    "06:15 AM",
                    "06:35 AM",
                    "07:25 AM",
                    "07:55 AM",
                    "08:20 AM",
                    "09:00 AM",
                    "10:00 AM",
                ],
            },
        ],
    },
];