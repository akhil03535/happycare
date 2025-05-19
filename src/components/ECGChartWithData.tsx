// ECGChartWithData.tsx

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ECGChart from './ECGChart';

interface Props {
  channelId: string;
  apiKey: string;
}

const ECGChartWithData: React.FC<Props> = ({ channelId, apiKey }) => {
  const [ecgData, setEcgData] = useState<number[]>([]);

  useEffect(() => {
    const fetchECGData = async () => {
      try {
        const response = await axios.get(`https://api.thingspeak.com/channels/${channelId}/feeds.json`, {
          params: {
            api_key: apiKey,
            results: 100, // fetch last 100 entries, you can increase/decrease
          }
        });

        const feeds = response.data.feeds;

        const parsedData = feeds.map((feed: any) => {
          try {
            return JSON.parse(feed.field4 || '[]');
          } catch {
            return [];
          }
        }).flat();

        setEcgData(parsedData);
      } catch (error) {
        console.error('Failed to fetch ECG data:', error);
      }
    };

    if (channelId && apiKey) {
      fetchECGData();
    }
  }, [channelId, apiKey]);

  return <ECGChart data={ecgData} />;
};

export default ECGChartWithData;
