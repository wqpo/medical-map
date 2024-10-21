const hospitals = [
    
    {
        name: "Takada Orthopedic Clinic",
        departments: ["🦴 Orthopedics"],
        languages: ["English (2 staff: Doctor/Pharmacist)"],
        patientsInformation: ["Chinese: 10%", "Vietnamese: 10%"],
        interviewSheet: ["English available", "Options such as Yes/No", "Free description field available"],
        flowFromReceptionToExamination: ["We will explain in English", "We will call you by your name. If there is no response, we will look for you in the waiting room."],
        medicinePickupLocation: "Pharmacy",
        coordinates: [36.1227575613791, 140.10010230205478]
    },
    {
        name: "Sone Dental Clinic",
        departments: ["🦷 Dentistry"],
        languages: ["English", "Chinese"],
        patientsInformation: [
            "・Chinese: 90%",
            "・Portuguese: 1%"
        ],
        interviewSheet: ["Japanese only"],
        flowFromReceptionToExamination: [
            "We will explain in Japanese only.",
            "We will call you by your name."
        ],
        medicinePickupLocation: "In hospital",
        whatWeWantYouToKnowBeforeComing: [
            "☎️ Phone reservation"
        ],
        coordinates: [36.06879024747742, 140.16926446441795]
    },
    {
        name: "Tsukuba University of Technology, Faculty of Health Sciences, Center for Integrated Medical Care (筑波技術大学保健科学部附属東西医学統合医療センター)",
        departments: ["🧑‍⚕️ Internal Medicine", "✂︎ Surgery", "🦴 Orthopedics", "🩼 Rehabilitation", "🖐️ Dermatology", "🩵 Psychiatry"],
        languages: ["English (4 staff)"],
        patientsInformation: ["English: 80%, Chinese: 20%"],
        interviewSheet: ["English available", "Options such as Yes/No"],
        flowFromReceptionToExamination: [
            "Reception: explanation in English.",
            "Use visual information such as gestures and illustrations. Use translator.",
            "Call by name (If there is no response, go to the waiting room to find someone.)"
        ],
        medicinePickupLocation: "Pharmacy",
        whatWeWantYouToKnowBeforeComing: ["In hospital or out-of-hospital pharmacy"],
        coordinates: [36.09659694972685, 140.100008104484]
    },
    {
        name: "Arita Dermatology Clinic (有田皮膚科医院)",
        departments: ["🖐️ Dermatology"],
        languages: ["English (1 fluent doctor)"],
        patientsInformation: [
            "Chinese: 2% (We explained using a translator and writing Chinese characters)",
            "Vietnamese: 0.5% (We explained using a translator)",
            "Portuguese: 0.5% (Patients who cannot speak Japanese or English may come with a companion or friend to translate.)"
        ],
        interviewSheet: ["English available", "Free description field"],
        flowFromReceptionToExamination: [
            "Medical treatment process is written in English on the wall.",
            "We will call you by your name.",
            "Instructions on how to use the bathroom are provided in English and Chinese.",
            "If it is in English, a physician will be available by phone."
        ],
        medicinePickupLocation: "Pharmacy",
        coordinates: [36.0728166556568, 140.10581871186196]
    },
    {
        name: "Meijin Dental Clinic",
        departments: ["🦷 Dentistry"],
        languages: ["English", "Chinese", "Formosan"],
        patientsInformation: [
            "・English: 45%",
            "・Chinese: 50%",
            "・Portuguese: 3%",
            "・Formosan: 2%",
            "（Others…Indian, Afghanistan）"
        ],
        religionOfPatients: [
            "・Christianity",
            "・Muslim",
            "・Buddhism",
            "・Hinduism"
        ],
        interviewSheet: ["English available", "Options such as Yes/No"],
        flowFromReceptionToExamination: [
            "Reception staff will provide explanations in English and Japanese to the extent possible.",
            "The doctor will explain depending on the case.",
            "We will call you by your name. → If there is no response, we will look for you in the waiting room."
        ],
        medicinePickupLocation: "In hospital",
        whatWeWantYouToKnowBeforeComing: [
            "☎️ If you would like to have the foreign language support, please make a reservation by phone."
        ],
        coordinates: [36.070356, 140.1074632]
    },
    {
        name: "White Essence Dental Office Gori",
        departments: ["🦷 Dentistry"],
        languages: ["English", "Chinese", "Korean", "Vietnamese"],
        patientsInformation: [
            "・English: 10%",
            "・Chinese: 10%",
            "・Korean: 10%",
            "・Vietnamese: 10%",
            "・Others: 10%"
        ],
        interviewSheet: ["Using a translator, gestures, and illustrations"],
        flowFromReceptionToExamination: [
            "We will call you by your name to the examination room."
        ],
        medicinePickupLocation: "In hospital",
        coordinates: [36.08287558343931, 140.1104385726188]
    },
    {
        name: "Miyagawa Internal Medicine/Gastrointestinal Clinic",
        departments: ["🧑‍⚕️ Internal Medicine", "🥐 Gastroenterology"],
        languages: ["English", "Chinese"],
        patientsInformation: [
            "・English: 20%",
            "・Chinese: 80%"
        ],
        interviewSheet: [
            "English available",
            "Chinese available",
            "Free description field available"
        ],
        flowFromReceptionToExamination: [
            "We will explain by using a translator.",
            "We will call you by your name."
        ],
        medicinePickupLocation: "Pharmacy",
        coordinates: [36.06642239630914, 140.11916688794665]
    },
    {
        name: "Ota Clinic",
        departments: ["🧑‍⚕️ Internal Medicine", "👦 Pediatrics", "✂︎ Surgery", "🩲 Proctology"],
        languages: ["English", "Chinese"],
        patientsInformation: [
            "・English: 10%",
            "・Chinese: 10%"
        ],
        interviewSheet: [
            "English available",
            "Chinese available",
            "Options such as Yes/No"
        ],
        flowFromReceptionToExamination: [
            "We will explain in English and Japanese.",
            "We will call you by your receipt number."
        ],
        medicinePickupLocation: "Pharmacy",
        coordinates: [36.059329813390974, 140.1060138493016]
    },
    {
        name: "Minami Odori Clinic",
        departments: ["🧑‍⚕️ Internal Medicine", "✂︎ Surgery", "👦 Pediatrics", "🩲 Proctology"],
        languages: ["English", "Japanese", "German", "French", "Spanish"],
        patientsInformation: [
            "・Chinese: 10%"
        ],
        interviewSheet: [
            "English available",
            "Japanese available",
            "German available"
        ],
        flowFromReceptionToExamination: [
            "At the reception, we can explain in English, Japanese and German.",
            "We occasionally use French or Spanish phrases depending on the case.",
            "We will call you by your name."
        ],
        medicinePickupLocation: "Both",
        coordinates: [36.076756456652994, 140.12138948401608]
    },
    {
        name: "Inoue Dental Clinic",
        departments: ["🦷 Dentistry"],
        languages: ["English", "Chinese", "Korean"],
        patientsInformation: [
            "・Chinese: 10%",
            "・Korean: 20%",
            "・Others: 5%"
        ],
        interviewSheet: [
            "English available",
            "Options such as Yes/No",
            "Free description field available"
        ],
        flowFromReceptionToExamination: [
            "At the reception, we will explain in English.",
            "We will call you by your name."
        ],
        medicinePickupLocation: "In hospital",
        coordinates: [36.057360164103635, 140.1394230386329]
    },
    {
        name: "Okada Dental Clinic",
        departments: ["🦷 Dentistry"],
        languages: ["English", "Chinese", "Russian", "Belarusian", "British", "Brazilian", "Peruvian", "Vietnamese", "Thai", "Korean", "Canadian"],
        patientsInformation: [
            "Various nationalities including Chinese, Russian, Belarusian, British, Brazilian, Peruvian, Vietnamese, Thai, Korean, and Canadian."
        ],
        interviewSheet: [
            "The reception staff will fill out the medical questionnaire in your language by using Pockettalk or Google Translate.",
            "Options such as Yes/No",
            "Free description field available"
        ],
        flowFromReceptionToExamination: [
            "We will guide you when we call you."
        ],
        medicinePickupLocation: "In hospital",
        coordinates: [36.00190969993723, 140.12780222259903]
    },
    {
        name: "Tsukuba Gastroenterology/Endoscopy Clinic",
        departments: ["🧑‍⚕️ Internal Medicine", "🥐 Gastroenterology"],
        languages: ["English", "Chinese", "Vietnamese"],
        patientsInformation: [
            "Chinese: 50%",
            "Vietnamese: 10%"
        ],
        interviewSheet: [
            "We will explain in English by using a translator."
        ],
        flowFromReceptionToExamination: [
            "We will call you by your name to the examination room."
        ],
        medicinePickupLocation: "Pharmacy",
        whatWeWantYouToKnow: [
            "We try to keep the healthcare costs as low as possible."
        ],
        coordinates: [36.09279660269687, 140.09982316113516]
    },
    {
        name: "Sakuragaoka Dental Center Dental Clinic",
        departments: ["🦷 Dentistry"],
        languages: ["English", "Chinese", "Korean", "Vietnamese"],
        patientsInformation: [
            "Chinese: 10~20%",
            "Korean: 1~3%",
            "Vietnamese: 1~3%"
        ],
        interviewSheet: [
            "English available",
            "Options such as Yes/No",
            "When taking X-rays, we always confirm and provide explanation beforehand."
        ],
        flowFromReceptionToExamination: [
            "We will explain by using a translator.",
            "We will call you by your name to the examination room."
        ],
        medicinePickupLocation: "In hospital",
        whatWeWantYouToKnow: [
            "If you are accompanying someone who speaks Japanese, please come into the examination room with you. Otherwise, we will use a translator to explain.",
            "In case of an emergency, you can come to the hospital without making an appointment, but the waiting time may be longer. Therefore, please call us to discuss what time you will come, and please arrive in ample time."
        ],
        coordinates: [36.0900852925033, 140.1137728231221]
    },
    {
        name: "Tsukuba Citya Internal Medicine Clinic",
        departments: [
            "🧑‍⚕️ Internal Medicine",
            "🥐 Gastroenterology",
            "🫃 Gastrointestinal Medicine",
            "🪞 Endoscopic Medicine",
            "💨 Respiratory Medicine",
            "🌼 Allergy Department",
            "❤️ Cardiovascular Medicine",
            "🦋 Endocrine Surgery (Thyroid Specialist)",
            "🌿 Chinese Medicine",
            "🧬 Nephrology",
            "🫣 Stomach Cancer Screening",
            "🩸 Colon Cancer Screening"
        ],
        languages: ["English", "Vietnamese"],
        patientsInformation: [
            "Vietnamese: 30%"
        ],
        interviewSheet: [
            "English available",
            "Options such as Yes/No",
            "Free description field available"
        ],
        flowFromReceptionToExamination: [
            "At the reception, we will explain in English by using a translator, gestures and illustrations.",
            "We will call you by your name.",
            "If there is no response, we will look for you in the waiting room."
        ],
        medicinePickupLocation: "Pharmacy",
        coordinates: [36.08460261316977, 140.1127527691475]
    },
    {
        name: "Arita Clinic",
        departments: [
            "🧑‍⚕️ Internal Medicine",
            "🩲 Proctology",
            "Surgical Treatment",
            "🫃 Gastrointestinal Medicine",
            "💉 Pain Clinic",
            "🩺 Health Check"
        ],
        languages: ["English", "Chinese"],
        patientsInformation: [
            "Chinese: 1%",
            "Others: Afghan"
        ],
        interviewSheet: [
            "English available",
            "Free description field available"
        ],
        flowFromReceptionToExamination: [
            "We will explain by using a translator.",
            "We will call you by your name."
        ],
        medicinePickupLocation: "Pharmacy",
        whatWeWantYouToKnowBeforeComing: [
            "We introduced an internet medical questionnaire system called ambii. Currently, English and Chinese are available in this system (We plan to increase the number of supported languages in the future)."
        ],
        coordinates: [36.07287266757978, 140.1062881537963]
    },
    {
        name: "Takada Orthopedic Clinic",
        departments: ["🦴 Orthopedics"],
        languages: ["English"],
        patientsInformation: [
            "Chinese: 10%",
            "Vietnamese: 10%"
        ],
        interviewSheet: [
            "English available",
            "Options such as Yes/No",
            "Free description field available"
        ],
        flowFromReceptionToExamination: [
            "We will explain in English.",
            "We will call you by your name.",
            "If there is no response, we will look for you in the waiting room."
        ],
        medicinePickupLocation: "Pharmacy",
        coordinates: [36.132141789007946, 140.1006656008581]
    },
    {
        name: "Tsukuba White Dental Clinic",
        departments: ["🦷 Dentistry", "🦴 Orthodontics"],
        languages: ["English", "Chinese"],
        patientsInformation: [
            "English: 50%",
            "Chinese: 50%"
        ],
        interviewSheet: [
            "English available",
            "Chinese available",
            "Online medical questionnaire required"
        ],
        flowFromReceptionToExamination: [
            "If we know in advance that you are a non-Japanese speaking patient, we will schedule your appointment with an English speaking doctor/hygienist.",
            "Please fill out the online medical questionnaire in advance before coming to the hospital.",
            "We will explain by using a translator.",
            "The receptionist will use a translator to fill out the interview sheet.",
            "We will call you by your name.",
            "If there is no response, we will look for you in the waiting room."
        ],
        medicinePickupLocation: "Pharmacy",
        coordinates: [36.0845975, 140.0859348]
    },
    {
        name: "Community Clinic Tsukuba",
        departments: ["🧑‍⚕️ Internal Medicine"],
        languages: ["English", "Chinese"],
        patientsInformation: [
            "Chinese: 20%",
            "Others: 10%"
        ],
        interviewSheet: [
            "English available"
        ],
        flowFromReceptionToExamination: [
            "We will explain in Japanese.",
            "We will call you by your name.",
            "If there is no response, we will look for you in the waiting room."
        ],
        medicinePickupLocation: "Pharmacy",
        specialNote: "Before coming to the clinic, we would like you to first consult and inquire by phone from a Japanese-speaking representative.",
        coordinates: [36.0821438, 140.0859363]
    },
    {
        name: "Shibahara Clinic",
        departments: ["🧑‍⚕️ Internal Medicine"],
        languages: ["English"],
        patientsInformation: [
            "English: 80%"
        ],
        flowFromReceptionToExamination: [
            "At the reception, we will explain by using gestures and illustrations.",
            "We will call you by your name to the examination room."
        ],
        medicinePickupLocation: "Pharmacy",
        specialNote: "Please come with someone who can speak Japanese.",
        coordinates: [36.1446395, 140.0119975]
    }
];

// このファイルをモジュールとしてエクスポート
export default hospitals; 
