import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const BettingLimitsSettings = () => {
  const [limits, setLimits] = useState({
    minStake: null,
    maxStake: null,
    minAccumulator: null,
    maxAccumulator: null,
  });

  const handleSave = () => {
    alert("Betting limits saved successfully!");
  };

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold">Betting Limits</h2>

      <Card>
        <CardHeader>
          <CardTitle>Configure Betting Limits</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="minStake">Minimum Stake (₦)</Label>
              <Input
                id="minStake"
                type="number"
                placeholder="Enter minimum stake"
                value={limits.minStake || ""}
                onChange={(e) => setLimits({ ...limits, minStake: e.target.value })}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="maxStake">Maximum Stake (₦)</Label>
              <Input
                id="maxStake"
                type="number"
                placeholder="Enter maximum stake"
                value={limits.maxStake || ""}
                onChange={(e) => setLimits({ ...limits, maxStake: e.target.value })}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="minAccumulator">Minimum Accumulator (₦)</Label>
              <Input
                id="minAccumulator"
                type="number"
                placeholder="Enter minimum accumulator"
                value={limits.minAccumulator || ""}
                onChange={(e) => setLimits({ ...limits, minAccumulator: e.target.value })}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="maxAccumulator">Maximum Accumulator (₦)</Label>
              <Input
                id="maxAccumulator"
                type="number"
                placeholder="Enter maximum accumulator"
                value={limits.maxAccumulator || ""}
                onChange={(e) => setLimits({ ...limits, maxAccumulator: e.target.value })}
                className="mt-2"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Button size="lg" onClick={handleSave}>
        Save Limits
      </Button>
    </div>
  );
};

export default BettingLimitsSettings;
