import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gift, Plus } from "lucide-react";

const PromotionsModule = () => {
  const [promotions] = useState([
    {
      id: 1,
      name: "Welcome Bonus",
      type: "deposit_bonus",
      status: "active",
      budget: 5000000,
      spent: 1200000,
    },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold">Promotions</h2>
        <Button className="gap-2">
          <Plus className="h-4 w-4" /> Create Promotion
        </Button>
      </div>

      <div className="space-y-3">
        {promotions.map((promo) => (
          <Card key={promo.id}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Gift className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">{promo.name}</p>
                    <p className="text-sm text-muted-foreground">Budget: ₦{promo.budget.toLocaleString()}</p>
                    <div className="w-48 h-2 bg-secondary rounded-full mt-2">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${(promo.spent / promo.budget) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  Edit
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PromotionsModule;
