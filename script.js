async function copyURL(){
    try{
        let val = document.getElementById("urlOutput").value
        let btn = document.getElementById("copyURLBtn")
        await navigator.clipboard.writeText(val)
        btn.textContent = "Copied!"
        setTimeout(()=>{
            btn.textContent = "Copy URL"
        },2500)
    }
    catch(err){
        console.log("Failed to copy: "+err)
    }
}

async function sendFeedback(event){
    event.preventDefault();
    let feedback = document.getElementById("feedbackInput")
    let val = feedback.value
    
    let response = await fetch("/sendFeedback",{
        method: "POST",
        headers: {
            'Content-Type':'application/x-www-form-urlencoded'
        },
        body: `feedback=${encodeURIComponent(val)}`
    })
    if(response.ok){
        alert("Feedback sent successfully! Thank you for your valuable feedback!!")
    }
}

async function sendURL(event){
    event.preventDefault()
    let realURL = document.getElementById("urlInput").value
    let days = Number(document.getElementById("days").value)
    let hours = Number(document.getElementById("hours").value)
    let minutes = Number(document.getElementById("minutes").value)
    let seconds = Number(document.getElementById("seconds").value)
    let ttl = Number(days*86400  + hours*3600 + minutes*60 + seconds)
    let resultURL = document.getElementById("urlOutput")

    const response = await fetch('/sendURL', {
        method: "POST",
        headers: {
            'Content-Type':'application/x-www-form-urlencoded'
        },
        body: `realURL=${encodeURIComponent(realURL)}&ttl=${ttl}`
    })
    resultURL.value = await response.text()
    if(response.ok){
        alert("URL generated successfully!")
    }
}