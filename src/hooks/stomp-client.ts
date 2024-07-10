import { MutableRefObject, useEffect, useRef } from "react";
import { Client } from "@stomp/stompjs";

interface ResponseBase {
  id: string;
}

interface TextResponse extends ResponseBase {
  response: string;
  type: 'TEXT';
}

interface FhirResponse extends ResponseBase {
  content: string;
  type: 'FHIR';
}

export type Response = TextResponse | FhirResponse;

export interface StompClientParams {
  callback: (r: Response) => void
}

export const useStompClient = (params: StompClientParams) => {
  const clientRef: MutableRefObject<Client | null> = useRef(null);

  useEffect(() => {
    const client = new Client({
      brokerURL: `${import.meta.env.VITE_BASE_URL}/ws`,
      onConnect: () => {
        client.subscribe('/sub/response', message => {
          console.debug(`Received: ${message.body}`);
          params.callback(JSON.parse(message.body) as Response);
        });
      },
    });
    client.activate();

    clientRef.current = client;
    return () => {
      clientRef.current?.deactivate();
    }
  }, [params]);

  return clientRef;
};
