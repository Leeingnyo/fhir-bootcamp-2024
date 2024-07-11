export interface LineChartData {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[];
  xkey: string;
  xtype: 'string' | 'number' | 'date';
  values: string[];
  labels?: string[];
  yunit?: string;
}

export interface Chat {
  id: string;
  type: string;
  message?: string;
  fhir?: object;
  lineChart?: LineChartData[];
  timestamp: Date;
  term?: string[];
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
