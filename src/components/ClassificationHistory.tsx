import { Card } from "@/components/ui/card";
import { Music, Clock, TrendingUp } from "lucide-react";
import { format } from "date-fns";

interface Classification {
  id: string;
  fileName: string;
  genre: string;
  confidence: number;
  timestamp: number;
}

interface ClassificationHistoryProps {
  history: Classification[];
}

const ClassificationHistory = ({ history }: ClassificationHistoryProps) => {
  if (history.length === 0) {
    return (
      <Card className="p-8 bg-card border-border shadow-lg text-center">
        <Music className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
        <p className="text-muted-foreground">No classification history yet</p>
        <p className="text-sm text-muted-foreground mt-2">Upload and classify your first audio file!</p>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-card border-border shadow-lg">
      <div className="flex items-center gap-2 mb-6">
        <Clock className="w-5 h-5 text-primary" />
        <h3 className="text-xl font-semibold">Classification History</h3>
      </div>
      
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {history.map((item) => (
          <div
            key={item.id}
            className="p-4 rounded-lg bg-secondary border border-border hover:bg-secondary/80 transition-all animate-in fade-in slide-in-from-bottom duration-300"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <Music className="w-4 h-4 text-primary flex-shrink-0" />
                  <p className="font-medium truncate">{item.fileName}</p>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="px-2 py-1 rounded-full bg-primary/20 text-primary font-semibold">
                    {item.genre}
                  </span>
                  <span className="text-muted-foreground flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    {item.confidence}% confidence
                  </span>
                </div>
              </div>
              <div className="text-xs text-muted-foreground whitespace-nowrap">
                {format(item.timestamp, "MMM d, h:mm a")}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default ClassificationHistory;
