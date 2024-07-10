
export interface Chat {
  id: string;
  type: string;
  message?: string;
  fhir?: object;
  timestamp: Date;
}

export interface YourMessage extends Chat {
  type: 'other';
}

export interface MyMessage extends Chat {
  type: 'mine';
}

export const isYourMessage = (message: Chat): message is YourMessage => {
  return message.type === 'other';
};

export const isMyMessage = (message: Chat): message is MyMessage => {
  return message.type === 'mine';
};
