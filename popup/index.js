const token = localStorage.getItem("token");
let selectedCV = 0

// chrome.storage.local.set({ 'token': null })
// console.log('token', token);

async function selectCV(id) {
    try {

        let cvs = await fetch('https://jobstbd.com/api/talent/getCVs', {
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
                    selectCV(data[i].id);
                });
            }
            document.querySelector("#btnApply").disabled = false;
        }
    } catch (error) {
        console.log('There was an error', error);
        throw error;
    }
}



chrome.storage.local.get(["token"]).then(async (result) => {

    document.getElementById("loading").style.display = "block";
    document.getElementById("signedIn").style.display = "none";
    document.getElementById("notSignedIn").style.display = "none";

    const token = result.token;

    if (result.token === null || result.token === undefined || result.token === "") {
        document.getElementById("loading").style.display = "none";
        document.getElementById("signedIn").style.display = "none";
        document.getElementById("notSignedIn").style.display = "block";
    }
    else {
        try {
            let tokenValidate = await fetch('https://jobstbd.com/api/auth/validateToken', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });

            const { msg, err } = await tokenValidate.json();

            console.log('data', msg, err);

            if (msg) {

                selectCV(null);

                const applyButton = document.querySelector("#btnApply");

                applyButton.addEventListener("click", async () => {
                    chrome.tabs.query({ active: true, currentWindow: true }, async function (tabs) {
                        const url = tabs[0].url;
                        let response;
                        try {

                            response = await fetch('https://jobstbd.com/api/talent/apply', {
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

                document.getElementById("loading").style.display = "none";
                document.getElementById("signedIn").style.display = "block";
                document.getElementById("notSignedIn").style.display = "none";
            }


        } catch (error) {
            document.getElementById("loading").style.display = "none";
            document.getElementById("signedIn").style.display = "none";
            document.getElementById("notSignedIn").style.display = "block";
        }


    }

});


