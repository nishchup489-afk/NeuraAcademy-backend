import { useEffect, useState } from "react";
import api from "../../api/axios";
import { useParams } from "react-router-dom";

export default function ConfirmEmail() {
    const { token } = useParams();
   

    const [message, setMessage] = useState("");

    useEffect(() => {
        async function confirm() {
            try {
                 const res = await api.get(`/auth/confirm/${token}`);
                setMessage(res.data.message);
            } catch (err) {
                setMessage("Invalid or expired confirmation link");
                console.error(err.message)
            }
        }
        confirm();
    }, [token]);

    return (
        <>
            <h1>Email Confirmation</h1>
            <p>{message}</p>
        </>
    );
}
