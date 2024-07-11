import { MutableRefObject, useEffect, useRef } from "react";
import { Client } from "@stomp/stompjs";
import type { LineChartData } from "./chat";

interface ResponseBase {
  id: string;
}

interface EventResponse extends ResponseBase {
  type: 'EVENT';
  content: string;
}

interface DoneEventResponse extends ResponseBase {
  type: 'DONE_EVENT';
}

interface TextResponse extends ResponseBase {
  response: string;
  type: 'TEXT';
}

interface FhirResponse extends ResponseBase {
  content: string;
  type: 'FHIR';
}

interface LineChartResponse extends ResponseBase, LineChartData {
  type: 'LINE_CHART';
}

export type Response = EventResponse | DoneEventResponse | TextResponse | FhirResponse | LineChartResponse;

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
