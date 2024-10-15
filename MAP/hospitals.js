const hospitals = [
    {
        name: "Sakuragaoka Dental Center Dental Clinic(桜ヶ丘歯科センター)",
        departments: ["Dentistry"],
        languages: ["English"],
        patientsInformation: ["・Chinese: 10~20%", "・Korean: 1~3%", "・Vietnamese: 1~3%"],
        interviewSheet: ["English available", "Options such as Yes/No"],
        flowFromReceptionToExamination: ["Explained using a translator", "Called by name to the examination room"],
        medicinePickupLocation: "in hospital",
        coordinates: [36.08942679165845, 140.11382652533]
    },
    {
        name: "Takada Orthopedic Clinic(高田整形外科)",
        departments: ["Orthopedics"],
        languages: ["ENGLISH・・・２people (Doctor/Pharmacist)"],
        patientsInformation: ["・Chinese: 10%", "Vietnamese: 10%"],
        interviewSheet: ["English available", "Options such as Yes/No", "・Free description field available"],
        flowFromReceptionToExamination: ["・We will explain in English", "・We will call you by your name.→If there is no response, we will look for you in the waiting room."],
        medicinePickupLocation: "pharmacy outside the hospital",
        coordinates: [36.1227575613791, 140.10010230205478]
    },
    {
        name: "Sone Dental Clinic(曽根歯科医院)",
        departments: ["Dentistry"],
        languages: ["・ENGLISH  1 person ,・CHINESE・・・1 person"],
        patientsInformation: ["・Chinese •• • 90%, Portuguese...1% or less"],
        interviewSheet: ["At the reception, we will explain in Japanese, We will call you by your name"],
        flowFromReceptionToExamination: ["・We will explain in English", "・We will call you by your name.→If there is no response, we will look for you in the waiting room."],
        medicinePickupLocation: "in hospital",
        whatWeWantYouToKnowBeforeComing: ["If possible, please make a reservation by phone and we will adjust the schedule."],
        coordinates: [36.06884661697101, 140.16934493068237]
    }
];

// このファイルをモジュールとしてエクスポート
export { hospitals };
