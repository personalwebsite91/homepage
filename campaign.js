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
let campaignData = {};
let selectedDonationAmount = 0;
let donationIntentId = null;
// ============================================
// Elements
// ============================================
// ============================================
// Donation Elements
// ============================================

const donationModal = document.getElementById("donationModal");

const donateTopBtn = document.getElementById("donateTopBtn");

const donateBottomBtn = document.getElementById("donateBottomBtn");

const closeDonation = document.getElementById("closeDonation");
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



// Documents

const documentsContainer =
document.getElementById("documentsContainer");

// ============================================
// Masking Functions
// ============================================
// ============================================
// Donation Events
// ============================================

donateTopBtn.addEventListener("click", openDonation);

donateBottomBtn.addEventListener("click", openDonation);

closeDonation.addEventListener("click", closeDonationModal);
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
    campaignData = {
    application,
    patient,
    medical,
    documents
};
    if (documents?.patient_photo) {

    const { data, error } = await supabaseClient.storage
    .from("medical-documents")
    .createSignedUrl(documents.patient_photo, 3600);

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

    // accountHolder.textContent =
    //     application?.account_holder_name || "-";

    // bankName.textContent =
    //     application?.bank_name || "-";

    // maskedAccount.textContent =
    //     maskAccount(application?.account_number);

    // ifscCode.textContent =
    //     application?.ifsc_code || "-";

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
function openDonation() {

    donationModal.style.display = "block";

    renderConsentStep();

}

function closeDonationModal() {

    donationModal.style.display = "none";

}
function showStep(step){

    document.getElementById("step1").style.display="none";
    document.getElementById("step2").style.display="none";
    document.getElementById("step3").style.display="none";

    document.getElementById("step"+step).style.display="block";

    updateProgress(step);

}
function renderConsentStep() {

    showStep(1);

    const step1 = document.getElementById("step1");

    step1.innerHTML = `

<div class="donation-step">

    <h2>❤️ Review Before Donation</h2>

    <p class="step-description">
        This campaign has been independently verified by CureKshetra.
        Please review the information below before continuing.
    </p>

    <div class="trust-box">

        <div class="trust-item">
            ✅ Hospital Verified
        </div>

        <div class="trust-item">
            ✅ Patient Identity Verified
        </div>

        <div class="trust-item">
            ✅ Medical Documents Verified
        </div>

        <div class="trust-item">
            ✅ Direct Beneficiary Payment
        </div>

    </div>

    <div class="consent-box">

        <label class="check-item">
            <input type="checkbox" class="donationCheck">
            <span>I reviewed the campaign information.</span>
        </label>

        <label class="check-item">
            <input type="checkbox" class="donationCheck">
            <span>I reviewed the medical documents.</span>
        </label>

        <label class="check-item">
            <input type="checkbox" class="donationCheck">
            <span>I understand my donation goes directly to the beneficiary.</span>
        </label>

        <label class="check-item">
            <input type="checkbox" class="donationCheck">
            <span>CureKshetra never receives or stores donor funds.</span>
        </label>

    </div>

    <button
        id="continueDonation"
        class="btn primary continue-btn"
        disabled>

        Continue →

    </button>

</div>

`;

    const checks = document.querySelectorAll(".donationCheck");

    const btn = document.getElementById("continueDonation");

    checks.forEach(check => {

        check.addEventListener("change", () => {

            btn.disabled = ![...checks].every(c => c.checked);

        });

    });

btn.onclick = renderAmountStep;

}
function renderAmountStep(){

    showStep(2);

    const step2 = document.getElementById("step2");

    step2.innerHTML = `

<h2>❤️ Select Donation Amount</h2>

<p class="step-description">

Every contribution helps the patient receive treatment.

</p>

<div class="amount-grid">

<div class="amount-card" data-amount="100">₹100</div>

<div class="amount-card" data-amount="250">₹250</div>

<div class="amount-card" data-amount="500">₹500</div>

<div class="amount-card" data-amount="1000">₹1000</div>

<div class="amount-card" data-amount="5000">₹5000</div>

<div class="amount-card" id="customCard">

Custom

</div>

</div>

<div class="custom-amount">

<input
id="customAmount"
type="number"
placeholder="Enter amount">

</div>

<div class="step-buttons">

<button
class="btn secondary"
id="backStep1">

← Back

</button>

<button
class="btn primary"
id="continuePayment"
disabled>

Continue →

</button>

</div>

`;

    const cards =
    document.querySelectorAll(".amount-card");

    const input =
    document.getElementById("customAmount");

    const next =
    document.getElementById("continuePayment");

    cards.forEach(card=>{

        card.onclick=()=>{

            cards.forEach(c=>c.classList.remove("selected"));

            card.classList.add("selected");

            input.value="";

            selectedDonationAmount =
            Number(card.dataset.amount||0);

            next.disabled=
            selectedDonationAmount<=0;

        };

    });

    input.oninput=()=>{

        cards.forEach(c=>c.classList.remove("selected"));

        selectedDonationAmount =
        Number(input.value);

        next.disabled=
        selectedDonationAmount<=0;

    };

    document.getElementById("backStep1").onclick =
        renderConsentStep;

    next.onclick = async ()=>{

    next.disabled = true;

    next.textContent = "Preparing Payment...";

    const success = await saveDonationIntent();

    if(!success){

        next.disabled = false;

        next.textContent = "Continue →";

        return;

    }

    renderPaymentStep();

};

}
async function saveDonationIntent(){

    const { data, error } = await supabaseClient
        .from("donation_intents")
        .insert({

            application_id: applicationId,

            amount: selectedDonationAmount,

            status: "initiated"

        })
        .select()
        .single();

    if (error) {

    console.error(error);

    alert(error.message);

    return false;

}

    donationIntentId = data.id;

    return true;

}
function renderPaymentStep(){

    showStep(3);

    const step3 = document.getElementById("step3");

    const application = campaignData.application;
    const patient = campaignData.patient;
   const upiLink =
    "upi://pay" +
    "?pa=" + encodeURIComponent(application.upi_id) +
    "&pn=" + encodeURIComponent(application.account_holder_name) +
    "&am=" + selectedDonationAmount +
    "&cu=INR";
    const medical = campaignData.medical;

    step3.innerHTML = `

<div class="donation-step">

    <h2>❤️ Complete Your Donation</h2>

    <p class="step-description">

        Every contribution directly supports the verified beneficiary.

    </p>

    <div class="payment-summary">

        <div class="summary-card">

            <div class="summary-label">

                Donation Amount

            </div>

            <div class="summary-value amount">

                ₹${selectedDonationAmount.toLocaleString("en-IN")}

            </div>

        </div>

        <div class="summary-card">

            <div class="summary-label">

                Beneficiary

            </div>

            <div class="summary-value">

                ${patient.patient_name}

            </div>

            <small>

                ${medical.hospital_name}

            </small>

        </div>

    </div>


<div class="payment-center">

    <h3 class="qr-title">
        📱 Scan QR Code to Donate
    </h3>

    <p class="qr-subtitle">
        Open any UPI app and scan this QR code.
    </p>

    <div id="upiQRCode" class="upi-qr"></div>

    <div class="upi-id-box">

        <div class="upi-label">
            UPI ID
        </div>

        <div id="upiIdText" class="upi-value">
            ${application.upi_id}
        </div>

        <button id="copyUpiBtn" class="copy-btn">

            📋 Copy UPI ID

        </button>

    </div>

</div>

    <details class="bank-transfer">

        <summary>

            Need Bank Transfer?

        </summary>

        <div class="bank-details">

            <p><strong>Account Holder:</strong> ${application.account_holder_name}</p>

            <p><strong>Bank:</strong> ${application.bank_name}</p>

            <p><strong>Account No:</strong> ${application.account_number}</p>

            <p><strong>IFSC:</strong> ${application.ifsc_code}</p>

        </div>

    </details>

    <div class="security-box">

        <h4>

            🛡 Secure Donation

        </h4>

        <ul>

            <li>✔ Campaign Verified</li>

            <li>✔ Hospital Verified</li>

            <li>✔ Direct-to-Beneficiary Payment</li>

            <li>✔ CureKshetra never stores your money</li>

            <li>✔ Donation tracked securely</li>

        </ul>

    </div>

    <div class="step-buttons">

        <button
            class="btn secondary"
            onclick="renderAmountStep()">

            ← Back

        </button>

    </div>

</div>

`;
// Generate QR
document.getElementById("upiQRCode").innerHTML = "";

new QRCode(document.getElementById("upiQRCode"), {
    text: upiLink,
    width: 250,
    height: 250
});

// Copy UPI ID
document.getElementById("copyUpiBtn").onclick = async () => {

    await navigator.clipboard.writeText(application.upi_id);

    alert("UPI ID copied successfully.");

};
document.getElementById("gpayBtn").onclick =
() => launchUPI(upiLink,"gpay");

document.getElementById("phonepeBtn").onclick =
() => launchUPI(upiLink,"phonepe");

document.getElementById("paytmBtn").onclick =
() => launchUPI(upiLink,"paytm");

document.getElementById("bhimBtn").onclick =
() => launchUPI(upiLink,"bhim");

}
function updateProgress(step){

    const indicators = [
        document.getElementById("stepIndicator1"),
        document.getElementById("stepIndicator2"),
        document.getElementById("stepIndicator3")
    ];

    indicators.forEach((item,index)=>{

        item.classList.remove("active");
        item.classList.remove("completed");

        if(index+1 < step){

            item.classList.add("completed");

            item.innerHTML="✓";

        }

        else if(index+1===step){

            item.classList.add("active");

            item.innerHTML=index+1;

        }

        else{

            item.innerHTML=index+1;

        }

    });
    const line1 = document.getElementById("line1");
const line2 = document.getElementById("line2");

line1.classList.remove("completed");
line2.classList.remove("completed");

if(step >= 2){

    line1.classList.add("completed");

}

if(step >= 3){

    line2.classList.add("completed");

}

}
async function launchUPI(upiLink, method){

    const { error } = await supabaseClient
        .from("donation_intents")
        .update({
            payment_method: method,
            status: "payment_started"
        })
        .eq("id", donationIntentId);

    if(error){
        console.error(error);
        alert(error.message);
        return;
    }

    // 👇 Debug
    console.log("Generated UPI Link:");
    console.log(upiLink);

    alert(upiLink);

    window.location.href = upiLink;

}
function showPaymentConfirmation(upiLink, method){

    const application = campaignData.application;
    const patient = campaignData.patient;

    const proceed = confirm(
`You're about to donate ₹${selectedDonationAmount.toLocaleString("en-IN")}

Beneficiary:
${patient.patient_name}

UPI ID:
${application.upi_id}

This payment goes directly to the beneficiary.

Continue?`
    );

    if(proceed){

        openUPI(upiLink, method);

    }

}
async function openUPI(upiLink, method){

    const { error } = await supabaseClient
        .from("donation_intents")
        .update({
            payment_method: method,
            status: "payment_started"
        })
        .eq("id", donationIntentId);

    if(error){

        alert(error.message);

        return;

    }

    window.location.href = upiLink;

}