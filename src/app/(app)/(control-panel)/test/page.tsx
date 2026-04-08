"use client"

const SendEmail = () => {
    const sendEmail = async () => {
        const res = await fetch('/api/external/send-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: "ayush.jslab@gmail.com",
                name: "Ayush"
            })
        });

        const data = await res.json();
        console.log(data);
    };
    return (
        <button onClick={sendEmail}>Send Email</button>
    )
}

export default SendEmail