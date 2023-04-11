
//chrome.storage.local.set({ 'token': null })


async function selectCV(id, token) {

    let cvs = await fetch('https://jobstbd.com/api/talent/resume', {
        headers: {
            'Authorization': `Bearer ${token}`,
        }
    });

    const { data } = await cvs.json();

    if (data.length == 0) {
        document.querySelector("#cvList").innerHTML = "No CV Found. Please upload your CV first. <a href='https://jobstbd.com/talents/profile' target='_blank'>Click here</a>";
        document.querySelector("#btnApply").disabled = true;
    } else {
        if (id) {
            selectedCV = id;
        }
        else {
            selectedCV = data[0].id
        }
        let html = "<ul>";
        for (let i = 0; i < data.length; i++) {
            html += `<li id="li_${data[i].id}" class="m-2 ${data[i].id == selectedCV ? 'border border-2 border-indigo-100' : ''}"><div class="flex flex-row"><div>${data[i].id == selectedCV ? '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M12.75 15l3-3m0 0l-3-3m3 3h-7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg >' : ''}</div><div class="pt-1 pl-2"> ${data[i].file_name} </div> </li > `;
        }
        html += "</ul>";

        document.querySelector("#cvList").innerHTML = html;

        for (let i = 0; i < data.length; i++) {
            var link = document.getElementById(`li_${data[i].id}`);
            // onClick's logic below:
            link.addEventListener('click', function () {
                selectCV(data[i].id, token);
            });
        }
        document.querySelector("#btnApply").disabled = false;
    }

}

function addCVUploadChangeEvent(token) {

    const fileInput = document.querySelector("#dropzone-file");

    fileInput.addEventListener("change", async () => {

        if (fileInput.files.length > 0) {


            const file = fileInput.files[0];
            let data = await fetch(`https://jobstbd.com/api/s3/cvUpload`, {
                method: "POST",
                Authorization: `Bearer ${token}`,
                body: JSON.stringify({
                    name: `${file?.name}`,
                    type: file.type,
                    extension: file.name.split(".")[1]
                })
            })
            const { url, fileName } = await data.json();

            await fetch(url, {
                method: "PUT",
                body: file,
                headers: {
                    "Content-type": file.type,
                    "Access-Control-Allow-Origin": "*"
                }
            });

            console.log('resume ', token);

            const result = await fetch("https://jobstbd.com/api/talent/resume", {
                method: "POST",
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    file_name: file.name,
                    s3_file_name: `${fileName}`,
                }),
            });

            if (result.status == 404) {

                // chrome.storage.local.set({ 'token': null })

                main()
            }

            selectCV(null, token)

        }

    });
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
            let response;
            try {

                response = await fetch('https://jobstbd.com/api/talent/application', {
                    method: 'POST',
                    body: JSON.stringify({ url: url, cvId: selectedCV }),
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


        if (result.token === null || result.token === undefined || result.token === "") {
            signedOutActive();
        }
        else {
            try {
                let tokenValidate = await fetch('https://jobstbd.com/api/auth/validateToken', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    }
                });


                if (tokenValidate.status === 200) {

                    await selectCV(null, token);

                    await applyJob(token);

                    addCVUploadChangeEvent(token);

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


