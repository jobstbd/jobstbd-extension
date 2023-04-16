
//chrome.storage.local.set({ 'token': null })
let selectedProfile = null;
const apiURL = "https://jobstbd.com/api/extension/0.0.0.3";

async function getProfiles(token) {

    let profiles = await fetch(`${apiURL}/target`, {
        headers: {
            'Authorization': `Bearer ${token}`,
        }
    });

    const { data } = await profiles.json();
    console.log(data)
    if (data.length == 0) {
        document.querySelector("#btnApply").disabled = true;
    } else {

        let html = '<select id="profilesSelect" name="profiles" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5">';
        for (let i = 0; i < data.length; i++) {
            html += `<option value="${data[i].id}" ${i == 0 ? "selected" : ""}>${data[i].name}</option>`;
        }
        html += "</select>";

        document.querySelector("#profileList").innerHTML = html;

        document.querySelector("#btnApply").disabled = false;
    }

}

function loadingActive() {
    document.getElementById("loading").style.display = "block";
    document.getElementById("signedIn").style.display = "none";
    document.getElementById("notSignedIn").style.display = "none";
}

async function signedOutActive() {
    document.getElementById("loading").style.display = "none";
    document.getElementById("signedIn").style.display = "none";
    document.getElementById("notSignedIn").style.display = "block";

}

async function signedInActive() {
    document.getElementById("loading").style.display = "none";
    document.getElementById("signedIn").style.display = "block";
    document.getElementById("notSignedIn").style.display = "none";
}


async function applyJob(token) {
    const applyButton = document.querySelector("#btnApply");

    applyButton.addEventListener("click", async () => {
        chrome.tabs.query({ active: true, currentWindow: true }, async function (tabs) {
            const url = tabs[0].url;
            const selectedProfile = document.getElementById("profilesSelect").value;
            let response;
            try {

                response = await fetch(`${apiURL}/application`, {
                    method: 'POST',
                    body: JSON.stringify({ url: url, targetId: selectedProfile }),
                    headers: {
                        'Authorization': `Bearer ${token} `,
                    }
                });

                const jsn = await response.json();
                if (response?.ok) {
                    document.getElementById("spnResult").innerHTML = jsn.msg;
                } else {
                    document.getElementById("spnResult").innerHTML = jsn.err;
                }

            } catch (error) {
                console.log('There was an error', error);
                throw error;
            }

        });
    });
}

function main() {

    chrome.storage.local.get(["token"]).then(async (result) => {

        loadingActive();

        const token = result.token;
        console.log('token ', token);


        if (result.token === null || result.token === undefined || result.token === "") {
            signedOutActive();
        }
        else {
            try {
                let tokenValidate = await fetch(`${apiURL}/validateToken`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    }
                });


                if (tokenValidate.status === 200) {

                    await getProfiles(token);

                    await applyJob(token);

                    // addCVUploadChangeEvent(token);

                    await signedInActive();
                } else {
                    signedOutActive();
                }

            } catch (error) {
                signedOutActive();
            }


        }

    });
}

main();


