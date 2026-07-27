// ============================================
// Supabase Configuration
// ============================================

const SUPABASE_URL = "https://zluditwbdmwmyueqezbr.supabase.co";

const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpsdWRpdHdiZG13bXl1ZXFlemJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ4NzI4MTMsImV4cCI6MjEwMDQ0ODgxM30.W9ea2iP_Vrsb_ecB2ygPwLLN0TPJQejUmIKCKNgIpec";


const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

// ============================================
// Get Campaign ID
// ============================================

const params = new URLSearchParams(window.location.search);
const applicationId = params.get("id");

// ============================================
// Elements
// ============================================

const loading = document.getElementById("loading");
const errorContainer = document.getElementById("errorContainer");
const campaignContainer = document.getElementById("campaignContainer");
const documentModal =
document.getElementById("documentModal");

const documentFrame =
document.getElementById("documentFrame");

const documentTitle =
document.getElementById("documentTitle");

const closeDocument =
document.getElementById("closeDocument");
// Hero

const patientPhoto = document.getElementById("patientPhoto");
const verifiedBadge = document.getElementById("verifiedBadge");

const patientName = document.getElementById("patientName");
const patientType = document.getElementById("patientType");
const patientAge = document.getElementById("patientAge");
const patientGender = document.getElementById("patientGender");

const diseaseName = document.getElementById("diseaseName");
const hospitalName = document.getElementById("hospitalName");
const patientLocation = document.getElementById("patientLocation");
const requiredAmount = document.getElementById("requiredAmount");

// Story

const medicalSummary = document.getElementById("medicalSummary");

// Hospital

const hospitalNameSection = document.getElementById("hospitalNameSection");
const diseaseDuration = document.getElementById("diseaseDuration");

// Family

const applicantName = document.getElementById("applicantName");
const relationship = document.getElementById("relationship");

const maskedPhone = document.getElementById("maskedPhone");
const maskedAadhaar = document.getElementById("maskedAadhaar");

// Bank

const accountHolder = document.getElementById("accountHolder");
const bankName = document.getElementById("bankName");
const maskedAccount = document.getElementById("maskedAccount");
const ifscCode = document.getElementById("ifscCode");

// Documents

const documentsContainer =
document.getElementById("documentsContainer");

// ============================================
// Masking Functions
// ============================================

function maskPhone(phone){

    if(!phone) return "-";

    return phone.slice(0,3) +
           "******" +
           phone.slice(-3);

}

function maskAadhaar(aadhaar){

    if(!aadhaar) return "-";

    return aadhaar.slice(0,4) +
           " **** **** " +
           aadhaar.slice(-4);

}

function maskAccount(account){

    if(!account) return "-";

    return "********" +
           account.slice(-4);

}

// ============================================
// Load Campaign
// ============================================
loadCampaign();
async function loadCampaign(){

    try{

        if(!applicationId){

            throw new Error("Invalid Campaign");

        }

        // ===========================
        // Application
        // ===========================

        const {data:application,error:applicationError}

        = await supabaseClient

        .from("applications")

        .select("*")

        .eq("id",applicationId)

        .eq("status","live")

        .maybeSingle();

        if(applicationError) throw applicationError;

        // ===========================
        // Patient
        // ===========================

        const {data:patient}

        = await supabaseClient

        .from("application_patients")

        .select("*")

        .eq("application_id",applicationId)

        .maybeSingle();

        // ===========================
        // Medical
        // ===========================

        const {data:medical}

        = await supabaseClient

        .from("medical_details")

        .select("*")

        .eq("application_id",applicationId)

        .maybeSingle();

        // ===========================
        // Documents
        // ===========================

        const {data:documents}

        = await supabaseClient

        .from("medical_documents")

        .select("*")

        .eq("application_id",applicationId)

        .maybeSingle();

        // ===========================
        // Render
        // ===========================

        renderCampaign(
            application,
            patient,
            medical,
            documents
        );

    }

    catch(error){

        console.error(error);

        loading.style.display="none";

        errorContainer.style.display="block";

    }

}

async function renderCampaign(application, patient, medical, documents) {
    
    if (documents?.patient_photo) {

    const { data, error } = await supabaseClient.storage
    .from("medical-documents")
    .createSignedUrl(documents.patient_photo, 300);

if (error) {
    console.error(error);
} else {
    patientPhoto.src = data.signedUrl;
}

    // patientPhoto.src = data.publicUrl;

}
    patientName.textContent = patient?.patient_name || "-";
    patientType.textContent = patient?.patient_type || "-";
    patientAge.textContent = patient?.age || "-";
    patientGender.textContent = patient?.gender || "-";

    diseaseName.textContent = medical?.disease_name || "-";
    hospitalName.textContent = medical?.hospital_name || "-";
    hospitalNameSection.textContent = medical?.hospital_name || "-";
    diseaseDuration.textContent = medical?.disease_duration || "-";

    patientLocation.textContent =
        `${application?.applicant_city || ""}, ${application?.applicant_state || ""}`;

    requiredAmount.textContent =
        Number(application?.required_amount || 0).toLocaleString("en-IN");

    medicalSummary.textContent =
        medical?.medical_summary || "";

    applicantName.textContent =
        application?.applicant_name || "-";

    relationship.textContent =
        application?.relationship || "-";

    maskedPhone.textContent =
        maskPhone(application?.applicant_mobile);

    maskedAadhaar.textContent =
        maskAadhaar(application?.applicant_aadhaar);

    accountHolder.textContent =
        application?.account_holder_name || "-";

    bankName.textContent =
        application?.bank_name || "-";

    maskedAccount.textContent =
        maskAccount(application?.account_number);

    ifscCode.textContent =
        application?.ifsc_code || "-";

    renderDocuments(documents);

    loading.style.display = "none";
    campaignContainer.style.display = "block";
    console.log("Documents:", documents);
console.log("Patient Photo:", documents?.patient_photo);
console.log("Disease Document:", documents?.disease_document);

}
async function renderDocuments(documents) {

    documentsContainer.innerHTML = "";

    const documentList = [
        {
            title: "Hospital Certificate",
            path: documents.disease_document
        },
        {
            title: "Doctor Prescription",
            path: documents.doctor_prescription
        }
    ];

    for (const doc of documentList) {

        if (!doc.path) continue;

        const { data, error } = await supabaseClient.storage
            .from("medical-documents")
            .createSignedUrl(doc.path, 300);

        if (error) continue;

        documentsContainer.innerHTML += `
            <div
class="doc"
onclick="openDocument('${doc.title}','${data.signedUrl}')">

📄 ${doc.title}

</div>
        `;
    }
    }
    function openDocument(title,url){

    documentTitle.textContent = title;

    documentFrame.src = url;

    documentModal.style.display = "block";

}

closeDocument.onclick = function(){

    documentFrame.src = "";

    documentModal.style.display = "none";

}
// ============================================

document.addEventListener("contextmenu", e => e.preventDefault());

document.addEventListener("dragstart", e => e.preventDefault());

document.addEventListener("selectstart", e => e.preventDefault());
document.addEventListener("keydown", function(e){

    // F12
    if(e.key === "F12"){
        e.preventDefault();
    }

    // Ctrl+Shift+I / J / C
    if(e.ctrlKey && e.shiftKey &&
       ["I","J","C"].includes(e.key.toUpperCase())){
        e.preventDefault();
    }

    // Ctrl+U (View Source)
    if(e.ctrlKey && e.key.toUpperCase() === "U"){
        e.preventDefault();
    }

    // Ctrl+S (Save Page)
    if(e.ctrlKey && e.key.toUpperCase() === "S"){
        e.preventDefault();
    }

});