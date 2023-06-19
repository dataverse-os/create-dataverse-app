import React, { useState } from "react";
import { LivepeerConfig, Player, ReactClient } from "@livepeer/react";

interface IProps {
  reactClient: ReactClient;
  playbackId: string;
}

export const LivepeerPlayer = ({ reactClient, playbackId }: IProps) => {
  const submitPlaybackId = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  return (
    <LivepeerConfig client={reactClient}>
      {playbackId && (
        <Player
          title="Waterfalls"
          playbackId={playbackId}
          showPipButton
          showTitle={false}
          aspectRatio="16to9"
          controls={{
            autohide: 3000,
          }}
          theme={{
            borderStyles: { containerBorderStyle: undefined },
            radii: { containerBorderRadius: "10px" },
          }}
        />
      )}
    </LivepeerConfig>
  );
};
