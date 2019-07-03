import { parseTSV } from "./parseTSV";
const importMnSProjecten = parseTSV(`
Code	AFK	Project	Instituut	Projectleider	Product Owner	Team	2019 UREN	Q1 2019	Q2 2019	Q3 2019	Q4 2029	2019 TOTAAL	Project brief
320-1601		Access and Use rights management system	IISG	Eric de Ruijter	ERU	CI	200		100	100		200	Nee
399-9-0010		Delivery 2.0	IISG	Thijs van Leeuwen	ERU	CI	56	56				56	PID
300-2-0041		Delivery 5.0	IISG	Thijs van Leeuwen	ERU	CI?	?	?	?				
300-2-0010		Diamonds in Borneo	IISG	Karin Hofmeester	ERU		24	6	6	6	6	24	Nee
300-2-0001		Diamantbewerkers	IISG	Karin Hofmeester	RZY							0	Nee
399-9-0011		E-mail, social media, websites	IISG	Robert Gillesse	ERU	CI	58	58				58	PID
399-9-0012		ELHN congres	IISG	Matthias van Rossum	RZY		24	24				24	Nee
320-2838		ESSHC 2020	IISG	Els Kuperus	RZY		100					0	Nee
320-1601		iisg.amsterdam part2	IISG	Marcel Boontje	ERU	CI	120	40	40		40	120	Nee
300-4-003		Meertens vragenlijsten	Meertens	Nicoline van der Sijs	MBR	Text 	31	31				31	~Ja
340-6200		MI Flat Data IT	Meertens	?	MBR	SD	318	159	159			318	Nee
300-2-0035		Migratiecongres	IISG	Leo Lucassen	RZY		40					0	Nee
300-4-0007		NDE voorziening Termennetwerk	Meertens	?	MBR	SD	26	26				26	Nee
300-2-0024		Oral history transcription Chain Pilot 	IISG	Eric de Ruijter	ERU	CI	200			100	100	200	Nee
399-9-0013		Presentatie digitale tijdschriften	IISG	Eric de Ruijter	ERU		40		40			40	Nee
320-1601		Resource Description And Access	IISG	Mieke Stroo	ERU	CI	16	16				16	PID
399-9-0014		Verbetering Thesaurus	IISG	Marja Musson	ERU	CI	24	24				24	Nee
399-9-0015		Verrijking metadata pilot	IISG	Erhan Tuskan	ERU		48	12	12	12	12	48	Nee
399-9-0016		Update Nederlandse Voornamenbank	Meertens	Douwe Zeldenrust	MBR	SD	240	120	120			240	Ja
`);
