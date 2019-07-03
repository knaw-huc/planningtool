import { parseTSV } from "./parseTSV";
export const deliverablesImport = parseTSV(`
Project	Code	Label	description	deadline	deadline reason
AMDI	AMDI-01	Quality checks	quality check pipeline (using Archivematica automation tools)		
AMDI	AMDI-02	user notification	Users are notified if the quality check failed		
AMDI	AMDI-03	AIP download	AIP can be manually downloaded from Archivematica		
AMDI	AMDI-04	IIIF viewer	Succesful imports can be viewed using the IIIF viewer		
AMMI	AMMI-01	Overgezet	De data is van de oude storage af	2019-Q1	Storage contract loopt af (IIRC jauco)
AMMI	AMMI-02	quadrupel	De data is in de nieuwe storage 4 keer gedupliceerd		
AMMI	AMMI-03	in archivematica	De data is in beheer van archivematica		
AMMI	AMMI-04	PIDs over	De persistent identifiers zijn overgezet van de SOR naar Archivematica		
ASBE	ASBE-01	Overgezet	Current EAD descriptions migrated from Xmetal to ArchivesSpace	2019-Q3	Will possibly be done by an external company
ASBE	ASBE-02	templates	Template available in ArchivesSpace for new archival descriptions	2019-Q2	Most work not by DI, just support
ASBE	ASBE-03	API available	Export of EAD's from ArchivesSpace can be retrieved from the Archives API	2019-Q3	
ASBE	ASBE-04	Archivematica link	Archivematica adds links (and metadata) to Archiverspace descriptions	2019-Q4	
ASRE	ASRE-01	test env	A test environment will be available for ArchivesSpace	2019-Q1	Needed as a start for all other activities
ASRE	ASRE-02	acqdb2AS	Current registrations migrated from Acquisition database to ArchivesSpace	2019-Q2	Probably done manually
ASRE	ASRE-03	templates	Template available in ArchivesSpace for new archival descriptions	2019-Q2	Most work not by DI, just support
ATM	ATM-01	data inlezen			
CEDI	CEDI-01	installatie	ICTS pakket laten installeren		
CL2	CL2-01	CMDI2RDF			
CL2	CL2-02	edit gui			
CL3V	CL3V-01	VRE			
CP2AI	CP2AI-01				
CP2CL	CP2CL-01	CLAAS			
CP2IA	CP2IA-01	transkribus as a service			
CP2SA	CP2SA-01	azalai			
GA1	GA1-01	Reconciliation	reconciliation tool		
GA1	GA1-02	Tim2SPARQL	sparql sync		
GA1	GA1-03	data-browser	browsing interface backend		
GA4	GA4-01	UI scenario	UI scenario's		
GA4	GA4-02	GEO browser	Browsing interface met geo		
GA4	GA4-03	exports	export naar qgis en gephi		
GA4	GA4-04	Ontology validator	ontology validation		
GA4	GA4-05	Data quality UI	data quality UI		
HIT	HIT-01	recogniser	Be able to recognise items from a user maintained authority list (remote XML file) in the ead's		
HIT	HIT-02	validator	Allow for semi-manual validation of the matching result (using some sort of UI)		
HIT	HIT-03	writer	write the results back to the EAD		
HIT	HIT-04	generalise	Make this useable for other people who use EAD files		
HIT	HIT-05	workflow	execute this process for each EAD (preferably as a scheduled automatic task)		
HIT	HIT-06	add places	(optional) Be able to recognise places (no authority list specified)		
HIT	HIT-07	add dates	(optional) Be able to recognise dates (no authority list specified)		
HIT	HIT-08	add titles	(optional) Be able to recognise book titles (no authority list specified)		
HIT	HIT-09	ignore-non-dutch	(optional) It would be nice to ignore metadata in foreign languages. The target is Dutch.		
IIIFA	IIIFA-01	born-digital	Born digital archives can be viewed through a IIIF viewer as folders and files	2018-Q4	presentation at IALHI conference
IIIFA	IIIFA-02	access rights	The viewer can handle access rights such as open, restricted and closed	2019-Q1	end of project
IIIFD	IIIFD-01	digitized	Digitized files can be viewed through a IIIF viewer	2019-Q2	migration through archivematica requests IIIF access, service has to be continued
IIIFD	IIIFD-02	metadata	The viewer will also show metadata along the digital file	2019-Q2	
IIIFD	IIIFD-03	audio/video	The viewer gives access to all kinds of material (images, audio, video)	2019-Q2	
LD	LD-01	Prod-release	Website in productie		
OWFH	OWFH-01	wordpress online	Nieuwe wordpress in de lucht waar redactie in kan werken		
REPIM	REPIM-01	IIIF API	IIIF store / image server for scanned images (including image metadata)	July 2019	images NA deadline
REPIM	REPIM-02	OCR	Tool for OCR on images of the Resoluties: image segmenting / font recognition / text recognition	March 2019	start corrrection OCR in preparation of production
REPIM	REPIM-03	annotation tool	Annotation tool for annotating resolutions (semi-automatic integrated annotation for images and imperfect tekst)		develop in stages with input from OCR and HTR results. This is an iterative process
REPIM	REPIM-04	Crowdsrc env OCR	Crowdsourcing environment OCR (correction of mistakes)	March 2019	at project start OCR correction will start; Crowd sourcing proper will start from the summer
REPIM	REPIM-05	HTR	Transcription environment for HTR (Transkribus)	March 2019	Transkribus environment will serve for transcriptions used for HTR engine training
REPIM	REPIM-06	HTR application	Tool for HTR on images of the Resoluties	December 2019	HTR will start with arrival of manuscript images; expected from end 2019
REPTX	REPTX-01	Image enh	Image enhancement tool: de-skewing, quality enhancement	July 2019	images NA deadline; start of production OCR
REPTX	REPTX-02	Crowdsrc env HTR	Crowdsourcing environment HTR	December 2019	After start production HTR, crowd correction will start
REPTX	REPTX-03	NER2SemLayer	Tool for integrating NER results and semantic layer		to be developed in cooperation with annotation framework
REPTX	REPTX-04	Lexica	Lexica for OCR and HTR tools	March 2019	Needed for OCR, but improve in iterations using correction
REPTX	REPTX-05	Workflow framework	Technical framework allowing user interfaces to access and reproduce research results, maintaining provenance of all intermediate steps		major final result
REPTX	REPTX-06	Text layer	Integrated text layer of resolution tekst		In the final result, an integrated text layer is necessary for querying. This is a major deliverable. During the project, working access is also acceptable
REPTX	REPTX-07	research GUI	User interface that allows scholarly users to interact (search, browse, analyze and visualize) with the fulltext edition, metadata and annotations		major final result
REPTX	REPTX-08	Ner tool	Tool for NER (names, places, institutes) on transcriptions of the Resoluties	December 2020	final version, but earlier versions should be usable in the project and iteratively improved upon
REPTX	REPTX-09	text api	API for access to texts		depends on 9
REPTX	REPTX-10	Entity linker	Tool for entity linking / disambiguation of NER results (entity resolution): automatic decision and user guiding (incl interface)	December 2020	final version, but earlier versions should be usable in the project and iteratively improved upon
REPTX	REPTX-11	semantic layer api	API for access to semantic layer		depends on 12
REPTX	REPTX-12	SemLayer API	Layered semantic access framework based on curated indices		final result is a major deliverable. This is a cooperative result between developers and data management
REPTX	REPTX-13	tool docs	Documentation of tools		depends on development of tools
REPTX	REPTX-14	api docs	Documentation of APIs		depends on development of APIs
STP	STP-01	Openrefine endpoint	Implement an openrefine endpoint on the timbuctoo datasets		
STP	STP-02	workflow	make the openrefine endpoint work for Oxford		
TTI	TTI-01	maatwerk apps uit	Controle of maatwerk applicaties goed zijn overgepakt en dan uitzetten		
`);
