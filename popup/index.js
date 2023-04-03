

// chrome.storage.local.set({ 'token': null })



const uploadButton = document.querySelector("#btnUpload");

uploadButton.addEventListener("click", async () => {

    const fileUpload = document.getElementById("file_input");


    if (fileUpload.files.length > 0) {

        const file = fileUpload.files[0];
        console.log(file.type, file.name)
        let data = await fetch(`http://127.0.0.1:3000/api/extension/talent/cvUpload`, {
            method: "POST",
            body: JSON.stringify({
                name: `${file?.name}`,
                type: file.type,
                extension: file.name.split(".")[1]
            })
        })


        const { url, token } = await data.json();

        console.log(url, token);

        const s3Result = await fetch(url, {
            method: "PUT",
            body: file,
            headers: {
                "Content-type": file.type,
                "Access-Control-Allow-Origin": "*"
            }
        })

        console.log(s3Result, token, url);

        chrome.storage.local.set({ 'token': token });

        main();
    }

});
function main() {
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
            // try {
            let tokenValidate = await fetch('http://127.0.0.1:3000/api/extension/talent/validateCVToken', {
                method: 'POST',
                body: JSON.stringify({ token: token }),
            });

            const { msg, err } = await tokenValidate.json();

            console.log('data', msg, err);

            if (msg) {

                const applyButton = document.querySelector("#btnApply");

                applyButton.addEventListener("click", async () => {
                    chrome.tabs.query({ active: true, currentWindow: true }, async function (tabs) {
                        const url = tabs[0].url;
                        let response;
                        try {

                            response = await fetch('http://127.0.0.1:3000/api/extension/talent/apply', {
                                method: 'POST',
                                body: JSON.stringify({ url: url, token: token }),
                                // headers: {
                                //     'Authorization': `Bearer ${ token } `,
                                // }
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


            // } catch (error) {
            //     document.getElementById("loading").style.display = "none";
            //     document.getElementById("signedIn").style.display = "none";
            //     document.getElementById("notSignedIn").style.display = "block";
            // }


        }

    });
}

main();



