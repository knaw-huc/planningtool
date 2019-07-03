import { parseTSV } from "./parseTSV";
export const importedProjects = parseTSV(`
Code	Groep	AFK	Project	Instituut	Projectleider	Product Owner	Team	AKA	status	 Eigen Bijdrage 2019 	 Ext. Fin. 2019 	 Totaal budget 2019 	 Uurtarief 	 Resterend budget per 1/1/2019 	 Resterend budget in uren per 1/1/2019 	2019 UREN	Realisatie Q1	Q2 2019	Q3 2019	Q4 2029	2019 TOTAAL	Project brief
300-2-0004	IISG.amsterdam	5EMI	Update website vijf eeuwen migr	IISG	Kors Visscher	ERU	CI		transacted	 € 3.400 	 ? 	 € 3.400 	 € 86,20 	 € 3.400,00 	39	39	2	37			39	Nee
300-1-0042	Anne Frank	AFEN	Anne Frank Engelse editie CI	Huygens ING	Karina van Dalen-Oskam	GGE	CI 		transacted		 € 4.832 	 € 4.832 	 € 68,25 	 € 4.832,00 	71	20				20	20	PID
300-1-0042	Anne Frank	AFEN	Anne Frank Engelse editie Design	Huygens ING	Karina van Dalen-Oskam	GGE	Design		transacted		 € 2.867 	 € 2.867 	 € 68,25 	 € 2.876,00 	42	42			21	21	42	PID
300-1-0042	Anne Frank	AFEN	Anne Frank Engelse editie Text	Huygens ING	Karina van Dalen-Oskam	GGE	Text 		transacted		 € 40.622 	 € 40.622 	 € 68,25 	 € 40.622,00 	595	150				150	150	PID
310-6320-22	Anne Frank	AFNL	AF Techniek NL	Huygens ING	Karina van Dalen-Oskam	GGE	Text 		transacted	 € 4.191 	 € 7.912 	 € 12.103 	 € 66,52 	 € 12.103,00 	182	182	185				185	PID
300-2-0006	Archivematica	AMDA	Archivematica WP dataverse	IISG	Robert Gillesse	ERU	CI		transacted	 € 27.200 		 € 27.200 	 € 85,00 	 ? 		320	5	120	120	75	320	Nee
300-2-0006	Archivematica	AMDI	Archivematica WP digitized	IISG	Robert Gillesse	ERU	CI		transacted	 € 17.000 		 € 17.000 	 € 85,00 	 ? 		200	33	80	87		200	PID
300-2-0006	Archivematica	AMMI	Archivematica WP migratie	IISG	Robert Gillesse	ERU	CI		transacted	 € 13.600 		 € 13.600 	 € 85,00 	 ? 		160	107	53			160	PID
300-2-0033	Archivespace	ASBE	ArchivesSpace WP beschrijving	IISG	Erhan Tuskan	ERU	CI		transacted	 € 10.200 		 € 10.200 	 € 85,00 	 ? 		120		40	40	40	120	PID
300-2-0034	Archivespace	ASMA	ArchivesSpace WP magazijnen	IISG	Erhan Tuskan	ERU	CI		transacted	 € 3.400 		 € 3.400 	 € 85,00 	 ? 		40				40	40	Nee
300-2-0033	Archivespace	ASRE	ArchivesSpace WP registratie	IISG	Erhan Tuskan	ERU	CI		transacted	 € 6.800 		 € 6.800 	 € 85,00 	 ? 		80		40	40		80	PID
300-4-0034	Amsterdam Timemachine	ATM	ATM Personeel DI SD	Huygens ING	?	MBE	SD		transacted		 € 1.703 	 € 1.703 	 € 42,58 	 ? 		40			20	20	40	Nee
300-4-0034	Amsterdam Timemachine	ATM	ATM Personeel DI CI	Huygens ING	?	MBE	CI		transacted		 € 3.483 	 € 3.483 	 € 42,58 	 ? 		82			41	41	82	Nee
300-4-0034	Team Geo	ATM	ATM Personeel DI Geo	Huygens ING	?	MBE	HisGIS		transacted		 € 29.643 	 € 29.643 	 € 42,58 	 ? 		696			348	348	696	Nee
300-5001	Bedrijfsbureau	AVGH	AVG HUC personeel DI	HuC	Yildiz van den Akker	ERU	CI		transacted	 € 5.000 		 € 5.000 	 € 86,20 	 € 5.000,00 	58	58	14	15	15	15	58	Nee
300-4-0012	CLARIN	CE18B	CLARIN ERIC 2018 Broeder	Meertens	?	MBR	SD		transacted		 € -   	 € -   	 € 61,54 	 € -   	0	0	34				34	Nee
300-4-0011	CLARIN	CE18W	CLARIN ERIC 2018 Windhouwer	Meertens	?	MBR	SD		transacted		 € -   	 € -   	 € 58,10 	 € -   	0	0	47				47	Nee
300-2-0039	Collecting e-mail	CEDI	Collecting e-mail DI	IISG		ERU	CI		committed							0	45				45	Nee
340-6195	CLARIAH Core	CL2	Clariah WP 2 15-024 Koppeling infra WP3 CI	Meertens	Jauco Noordzij	MBR	CI		transacted		 € 5.289 	 € 5.289 	 € 45,00 	 € 5.289,40 	118	118		39	39	39	118	Nee
340-6195	CLARIAH Core	CL2	Clariah WP 2 15-024 Koppeling infra WP3 SD	Meertens	Jauco Noordzij	MBR	SD		transacted		 € 47.605 	 € 47.605 	 € 45,00 	 € 47.604,60 	1058	1058	512	182	182	182	1058	Nee
340-6185	CLARIAH Core	CL3B	Clariah WP 3 Coördinatie	Meertens	Antal van den Bosch	MBR	Daan		transacted								69				69	Nee
340-6185	CLARIAH Core	CL3C	Clariah WP 3 Concern infra	Meertens	Antal van den Bosch	MBR	CI		transacted		 € 8.400 	 € 8.400 	 € 49,90 	 € 8.400,00 	168	168	79	30	30	30	168	Nee
340-6185	CLARIAH Core	CL3S	CLARIAH WP3 (Overige SD)	Meertens	Antal van den Bosch	MBR	SD		transacted		 € 25.040 	 € 25.040 	 € 49,90 	 € 25.040,00 	502	502	118	120	120	120	478	Ja
340-6185	CLARIAH Core	CL3T	CLARIAH WP3 (Overige Text)	Meertens	Antal van den Bosch	MBR	Text 		transacted		 € 25.040 	 € 25.040 	 € 49,90 	 € 25.040,00 	502	502	5	158	158	158	479	Ja
340-6185	CLARIAH Core	CL3V	CLARIAH WP3 (VRE)	Meertens	Antal van den Bosch	MBR	SD		transacted		 € 25.040 	 € 25.040 	 € 49,90 	 € 25.040,00 	502	502	312	64	64	64	502	Ja
300-4-0040	CLARIN	CLER	CLARIN ERIC 2019 Windhouwer (Menzo)	Meertens	Gertjan Filarski	MBR	SD		transacted		 € 19.000 	 € 19.000 	 € 58,10 	 € 20.091,14 	346	327	79	83	83	83	327	Nee
300-4-0040	CLARIN	CLER	CLARIN ERIC 2019 Windhouwer (SD)	Meertens	Gertjan Filarski	MBR	SD		transacted		 € 28.500 	 € 28.500 	 € 34,84 	 € 50.227,86 	1442	818	103	238	238	238	818	Nee
300-1-0040	CLARIAH Plus	CP2AI	Clariah Plus WP 2 Annotation infrastructure	Huygens ING	Ronald Dekker	MBE	R&D		transacted		 € 84.895 	 € 84.895 	 € 49,90 	 € 339.579 	6805	1701	316	462	462	462	1701	Nee
300-1-0040	CLARIAH Plus	CP2CI	CLARIAH Plus WP 2 CI	Huygens ING	Jauco Noordzij	MBE	CI		transacted	 € -   	 € -   	 € -   	 € 49,90 			0	139				139	Nee
300-1-0040	CLARIAH Plus	CP2CL	Clariah Plus WP 2  CLAAS	Huygens ING	Jauco Noordzij	MBE	Staf		transacted		 € 50.077 	 € 50.077 	 € 61,22 	 € 100.154 	1636	818	18	267	267	267	818	Nee
300-1-0040	Team Geo	CP2GA	CLARIAH Plus WP 2 GEO Analysis	Huygens ING	Jauco Noordzij	MBE	HisGIS		transacted		 € 37.731 	 € 37.731 	 € 49,90 	 € 37.731 	756	756			378	378	756	Nee
300-1-0040	CLARIAH Plus	CP2IA	CLARIAH Plus WP 2 Image Analysis	Huygens ING	Jauco Noordzij	MBE	Images		transacted		 € -   	 € -   	 € 49,90 	 € 150.924 	3025	0					0	Nee
300-1-0040	CLARIAH Plus	CP2SA	CLARIAH Plus WP 2 SD Analysis	Huygens ING	Jauco Noordzij	MBE	SD		transacted		 € 56.597 	 € 56.597 	 € 49,90 	 € 113.193 	2268	1134	1	378	378	378	1134	Nee
300-1-0040	CLARIAH Plus	CP2TA	CLARIAH Plus WP 2 Text Analysis	Huygens ING	Jauco Noordzij	MBE	Text 		transacted		 € 60.370 	 € 60.370 	 € 49,90 	 € 301.848 	6049	1210	9	400	400	400	1210	Nee
300-4-9003	CLARIAH Plus	CP3	CLARIAH Plus WP3 DB	Meertens	Gertjan Filarski	MBR	Daan		transacted		 € 20.185 	 € 20.185 	 € 49,90 	 ? 		405		135	135	135	405	Nee
300-4-9003	CLARIAH Plus	CP3	CLARIAH Plus WP3 SD	Meertens	Antal van den Bosch	MBR	SD		transacted		 € 20.185 	 € 20.185 	 € 49,90 	 ? 		405		135	135	135	405	Nee
300-2-0042	CLARIAH Plus	CP4	CLARIAH Plus WP4 IISG DI	IISG	Richard Zijdeman	RZY	SD		transacted		 € -   	 € -   	 € 49,90 	 ? 		0		0	0	0	0	Nee
300-1-0044	CLARIAH Plus	CP6C	CLARIAH Plus WP6 team CI	Huygens ING	Karina van Dalen-Oskam	MBE	CI		transacted			 € -   	 € 49,90 	 ? 		0		0	0	0	0	Nee
300-1-0044	CLARIAH Plus	CP6T	Clariah Plus WP 6 personeel DI team tekst en CI	Huygens ING	Karina van Dalen-Oskam	MBE	Text 		transacted		 € 70.605 	 € 70.605 	 € 49,90 	 ? 		1415	13	467	467	467	1415	Nee
320-2150	CLARIAH Core	CSDH	CLARIAH Structured Data Hub	IISG	Richard Zijdeman	RZY	CI		transacted		 € 4.000 	 € 3.100 	 € 86,20 	 € 3.100,00 	36	36	60				60	Nee
300-1-0019	Digital Forensics	DIF	Digital Forensics DI	Huygens ING	Mariken Teeuwen	MBE	Images		transacted		 € 82.960 	 € 82.960 	 € 49,90 	 € 217.647,00 	4362	1663	176	496	496	496	1663	Nee
300-4-0023	EOSC-hub	EOSC	EOSC-hub	Meertens	Gertjan Filarski	MBR	Daan		transacted		 € 52.626 	 € 52.626 	 € 82,14 	 € 105.252,00 	1281	641	45	199	199	199	641	Nee
300-1-0018	Evidence	EVH	EviDENce CI	Huygens ING	Marieke van Erp	MBE	CI		transacted		 € 1.200 	 € 1.200 	 € 46,15 		0	26					0	Nee
300-1-0018	Evidence	EVH	EviDENce Tx	Huygens ING	Marieke van Erp	MBE	Text 		transacted		 € 10.335 	 € 10.335 	 € 46,15 	 € 13.972,00 	303	224	229	21			250	Nee
300-4-0018	Evidence	EVM	Evidence Meertens deel CI	Meertens	Marieke van Erp?	MBR	CI		transacted		 € 1.846 	 € 1.846 	 € 46,15 		0	40		20	20		40	Nee
300-4-0018	Evidence	EVM	Evidence Meertens deel Tx	Meertens	Marieke van Erp?	MBR	Text 		transacted		 € 16.660 	 € 16.660 	 € 46,15 	 € 18.526,00 	401	361	35	163	163		361	Nee
310-6310-19	Golden Agents	GA1	Golden Agents WP1	Huygens ING	Charles van den Heuvel	MBE	SD		transacted			 € -   	 € 49,90 	 € -   	0	0	181				181	Ja
310-6310-19	Golden Agents	GA3	Golden Agents WP3	Huygens ING	Charles van den Heuvel	MBE	SD		transacted		 € -   	 € -   	 € 49,90 	 € 69.600,00 	1395	0					0	Nee
310-6310-19	Golden Agents	GA4	Golden Agents WP4 Design	Huygens ING	Charles van den Heuvel	MBE	Design		transacted		 € 12.774 	 € 12.774 	 € 49,90 	 € 39.000,00 	782	256	18	79	79	79	256	Ja
310-6310-19	Golden Agents	GA4	Golden Agents WP4	Huygens ING	Charles van den Heuvel	MBE	SD		transacted		 € 71.183 	 € 71.183 	 € 49,90 	 € 228.007,00 	4569	1427	11	472	472	472	1427	Ja
310-6310-19	Team Geo	GAHG	Golden Agents HisGis	Huygens ING	Charles van den Heuvel	MBE	HisGIS		transacted		 € 24.393 	 € 24.393 	 € 49,90 	 € 24.393,00 	489	489			244	244	489	Ja
300-4-0039	Historische Kranten	HISK	Historische kranten	Meertens	Nicoline van der Sijs	MBR	SD		transacted		 € 5.000 	 € 5.000 	 € 86,20 	 € 5.000,00 	58	58	28	30			58	Nee
300-2-0020	Hitime	HIT	HiTIME CI	IISG	Eric de Ruijter	ERU	CI		transacted		 € 3.600 	 € 3.600 	 € 85,00 	 € 3.600,00 	42	42	5	25	12		42	Nee
300-2-0020	Hitime	HIT	HiTIME Text	IISG	Eric de Ruijter	ERU	Text 		transacted		 € 17.346 	 € 17.346 	 € 85,00 	 € 17.346,00 	204	204	70	90	45		205	Nee
320-1603	IIIF IISG	IIIFA	IIIF WP archieven	IISG	Eric de Ruijter	ERU	SD		transacted	 € 3.400 		 € 3.400 	 € 85,00 	 ? 		44	44				44	PID
320-1603	IIIF IISG	IIIFD	IIIF WP digitized	IISG	Eric de Ruijter	ERU	SD		transacted	 € 18.190 		 € 18.190 	 € 85,00 	 ? 		238		238			238	PID
320-1603	IIIF IISG	IIIFZ	IIIF WP zoeken	IISG	Eric de Ruijter	ERU	SD		transacted	 € 18.190 		 € 18.190 	 € 85,00 	 ? 		238			119	119	238	Nee
300-4-0006	Isebel	ISE	ISEBEL CI	Meertens	Theo Meder	MBR	CI		transacted		 € 8.558 	 € 8.558 	 € 70,98 	 € 8.558,00 	121	121	3	39	39	39	121	Ja
300-4-0006	Isebel	ISE	ISEBEL SD	Meertens	Theo Meder	MBR	SD		transacted		 € 77.022 	 € 77.022 	 € 70,98 	 € 77.022,00 	1085	1085	252	278	278	278	1085	Ja
300-5002	Bedrijfsbureau	KA	KA vervanging A. Rijs	HuC	Yildiz van den Akker	ERU	CI		transacted	 € 6.200 		 € 6.200 	 € 86,20 	 € 6.200,00 	72	72	89				89	Nee
320-1100	IISG.amsterdam	LD	Linked Data DI	IISG	?	ERU	CI		transacted	 € 5.000 		 € 5.000 	 € 86,20 	 € 5.000,00 	58	58	68				68	Nee
300-1-9999	Migrants	MIGR	Migrant 2019	Huygens ING	Marijke van Faassen	MBE	R&D		transacted	 € 43.100 		 € 43.100 	 € 86,20 	 € 43.100,00 	500	500		150	175	175	500	Ja
300-1-0030	NMGN	NMGN	NMGN Webeditie DI	Huygens ING	Sebastiaan Derks	MBE	Design		transacted		 € 12.921 	 € 12.921 	 € 73,00 	 € 14.000,00 	192	177	81	32	32	32	177	Ja
300-1-0048	Ontvlechting WFH.nl DBNL.org	OWFH	Ontvlechting WFH.nl DBNL.org	Huygens ING	Peter Kegel	MBE	CI		transacted		 € 2.000 	 € 2.000 	 € 86,20 	 € 2.000,00 	23	23		23				
340-6189	CLARIAH Core WP2	PART	Parthenos Personeel DI	Meertens	Gertjan Filarski	MBR	Daan		transacted		 € 11.638 	 € 11.638 	 € 61,54 	 € 11.638,00 	189	189	93	32	32	32	189	Nee
310-6350-08	Prize Papers	PPV	Prize papers VRE ICT CI	Huygens ING	Jelle van Lottum	MBE	CI		transacted		 € 1.890 	 € 1.890 	 € 45,00 	 € 1.890,00 	42	42	21	21			42	Ja
310-6350-08	Prize Papers	PPV	Prize papers VRE ICT DE	Huygens ING	Jelle van Lottum	MBE	Design		transacted		 € 5.050 	 € 5.050 	 € 45,00 	 € 5.050,00 	112	112	99	13			112	Ja
310-6350-08	Prize Papers	PPV	Prize papers VRE ICT IM	Huygens ING	Jelle van Lottum	MBE	Images		transacted		 € 11.960 	 € 11.960 	 € 45,00 	 € 11.960,00 	266	266	267				267	Ja
300-1-0039	Republic	REPCI	Republic CI 	Huygens ING	Ida Nijenhuis	MBE	CI 		transacted			 € -   	 € 49,90 		0	17	17				17	Nee
300-1-0039	Republic	REPIM	Republic Images	Huygens ING	Ida Nijenhuis	MBE	Images		transacted		 € 47.899 	 € 47.899 	 € 49,90 	 € 124.365,00 	2492	986	1		427	427	854	Nee
300-1-0039	Republic	REPRD	Republik R&D	Huygens ING	Ida Nijenhuis	MBE	R&D		transacted		 € 31.933 	 € 31.933 	 € 49,90 	 € 208.813,00 	4185	612	72	180	180	180	612	Nee
300-1-0039	Republic	REPTX	Republic Text (+Design)	Huygens ING	Ida Nijenhuis	MBE	Text 		transacted		 € 68.656 	 € 68.656 	 € 49,90 	 € 591.100,00 	11846	1361			615	615	1230	Nee
300-4-0037	SSHOC	SSH	SSHOC (Daan Broeder)	Meertens	Gertjan Filarski	MBR	Daan		transacted		 € 54.000 	 € 54.000 	 € 66,01 	 € 27.000,00 	409	818	196	207	207	207	818	Nee
300-4-0033	Staat van het Nederlands	STNL	Staat van het Nederlands 	Meertens	Frans Hinskens	MBR			transacted	 € 1.360 		 € 1.360 	 € 86,20 	 € 1.360,00 	16	16	7				7	Nee
399-9-0006	Oxford projects	STP	Networking Archives CI	Huygens ING	Arno Bosse	MBE	CI	COFK, State Papers	committed		 € 1.375 	 € 1.375 	 € 50,00 	 € 1.375,00 	28	28			14	14	28	Nee
399-9-0006	Oxford projects	STP	Networking Archives Design	Huygens ING	Arno Bosse	MBE	Design	COFK, State Papers	committed		 € 3.600 	 € 3.600 	 € 50,00 	 € 3.600,00 	72	72			36	36	72	Nee
399-9-0006	Oxford projects	STP	Networking Archives SD	Huygens ING	Arno Bosse	MBE	SD	COFK, State Papers	committed		 € 8.775 	 € 8.775 	 € 50,00 	 € 8.775,00 	176	176			88	88	176	Nee
310-6310-18	Art of reasoning	TAOR	The art of reasoning ICT [?]	Huygens ING	Mariken Teeuwen	MBE	SD		transacted		 € 10.000 	 € 10.000 	 € 50,00 	 € 20.000,00 	400	200		100	100		200	Ja
310-6310-18	Art of reasoning	TAOR	The art of reasoning ICT Design	Huygens ING	Mariken Teeuwen	MBE	Design		transacted		 € 10.000 	 € 10.000 	 € 50,00 	 € 20.000,00 	400	200		100	100		200	Ja
340-6150	Time Capsule	TCA	Time Capsule CI	Meertens	Nicoline van der Sijs	MBR	CI		transacted		 € 710 	 € 710 	 € 43,32 		0	16	47				47	Ja
340-6150	Time Capsule	TCA	Time Capsule Text	Meertens	Nicoline van der Sijs	MBR	Text 		transacted		 € 6.394 	 € 6.394 	 € 43,32 	 € 7.095,00 	164	148	171				171	Ja
310-6376-15007	CLARIAH Core WP2	TIM	Tim Anansi CLARIAH WP2 ICT-ontw	Huygens ING	Gertjan Filarski	MBE	SD		transacted		 € 32.800 	 € 32.800 	 € 45,00 	 € 32.800,00 	729	729	345	345	39		729	
340-6181	TLA/FLAT	TLA	The Language Archive IT	Meertens	Gertjan Filarski	MBR	SD		transacted		 € 2.023 	 € 2.023 	 € 45,00 	 € 2.023,00 	45	45	44				44	Nee
300-1-0002	Triado	TRI	Triado DI CI	Huygens ING	Edwin Klijn (NIOD)	MBE	CI		transacted		 € 820 	 € 820 	 € 41,00 		0	20		20			20	Ja
300-1-0002	Triado	TRI	Triado DI IM	Huygens ING	Edwin Klijn (NIOD)	MBE	Images		transacted		 € 7.380 	 € 7.380 	 € 41,00 	 € 8.200,00 	200	180	39	141			180	Ja
300-2-0045	Bedrijfsbureau	TTI	TimeTell IISG	IISG	?	ERU	CI		transacted	 € 5.000 		 € 5.000 	 € 86,20 	 € 5.000,00 	58	58		29	29		58	
	Oxford projects	EMLO	EMPlaces & EMPeople	Huygens ING	Arno Bosse			EMLO							0	0						
300-4-0028	Vertrokken Nederlands	VNL	Vertrokken Nederlands DI	Meertens	Nicoline van der Sijs	MBR	CI		transacted		 € 1.000 	 € 1.000 	 € 86,20 	 € 1.000,00 	12	12		12			12	Ja
																						
			Maintenance & Support																			
300-5-9000	Maintenance & Support	MSHC	Maintenance & Support HuC	HuC	Yildiz van den Akker																	
300-1-9000	Maintenance & Support	MSHI	Maintenance & Support Huygens	Huygens ING		MBE				 € 86.200 		 € 86.200 	 € 86,20 	 € 86.200,00 	1000	1000	249	250	250	250	1000	
300-2-9000	Maintenance & Support	MSIC	Maintenance & Support IISG onderzoek	IISG		RZY				 € 99.130,00 		 € 99.130 	 € 86,20 	 € 99.130,00 	1150	1150	404	249	249	249	1150	
300-2-9001	Maintenance & Support	MSIO	Maintenance & Support IISG collecties	IISG		ERU				 € 99.130,00 		 € 99.130 	 € 86,20 	 € 99.130,00 	1150	1150	454	232	232	232	1150	
300-2-9001	Maintenance & Support	MSMI	Maintenance & Support Meertens	Meertens		MBR				 € 136.540,80 		 € 136.541 	 € 86,20 	 € 136.540,80 	1584	1584	516	356	356	356	1584	
`);
