import React from "react";
import EditProductClient from "./ui";


export default function Page({ params }: { params: { id: string } }) {
return <EditProductClient id={params.id} />;
}