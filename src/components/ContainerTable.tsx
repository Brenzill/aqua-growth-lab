import { ContainerSeal } from '@/types/edi';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Ship, Lock, Navigation } from 'lucide-react';

interface ContainerTableProps {
  containers: ContainerSeal[];
}

export const ContainerTable = ({ containers }: ContainerTableProps) => {
  if (containers.length === 0) {
    return (
      <Card className="p-8">
        <div className="text-center text-muted-foreground">
          <Ship className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No container data available</p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="p-6 border-b">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Ship className="h-6 w-6 text-primary" />
          Container & Seal Information
        </h2>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Season</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Org</TableHead>
              <TableHead>Stuff Date</TableHead>
              <TableHead>Container No.</TableHead>
              <TableHead>Seal Number</TableHead>
              <TableHead>Barcode</TableHead>
              <TableHead>No Cartons</TableHead>
              <TableHead>Gross</TableHead>
              <TableHead>Nett</TableHead>
              <TableHead>Commodity</TableHead>
              <TableHead>Variety</TableHead>
              <TableHead>Grade</TableHead>
              <TableHead>Pack</TableHead>
              <TableHead>Count</TableHead>
              <TableHead>Mark</TableHead>
              <TableHead>Target Market</TableHead>
              <TableHead>Country</TableHead>
              <TableHead>Farm No.</TableHead>
              <TableHead>PHC</TableHead>
              <TableHead>Orchard</TableHead>
              <TableHead>Insp. Date</TableHead>
              <TableHead>Insp. Point</TableHead>
              <TableHead>Insp. Code</TableHead>
              <TableHead>Intake Date</TableHead>
              <TableHead>Consignment No.</TableHead>
              <TableHead>Temptale</TableHead>
              <TableHead>Inventory</TableHead>
              <TableHead>PhytoData</TableHead>
              <TableHead>UPN</TableHead>
              <TableHead>Consec No.</TableHead>
              <TableHead>Target Country</TableHead>
              <TableHead>Production Area</TableHead>
              <TableHead>Ship Name</TableHead>
              <TableHead>Voyage No.</TableHead>
              <TableHead>Call Sign</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {containers.map((container) => (
              <TableRow key={container.id}>
                <TableCell>{container.season || '-'}</TableCell>
                <TableCell className="font-mono">{container.locationCode || '-'}</TableCell>
                <TableCell>{container.organization || '-'}</TableCell>
                <TableCell>{container.stuffDate || '-'}</TableCell>
                <TableCell className="font-mono font-semibold">
                  <Badge variant="outline" className="gap-1">
                    <Navigation className="h-3 w-3" />
                    {container.containerNo}
                  </Badge>
                </TableCell>
                <TableCell className="font-mono">
                  <Badge variant="secondary" className="gap-1">
                    <Lock className="h-3 w-3" />
                    {container.sealNumber}
                  </Badge>
                </TableCell>
                <TableCell className="font-mono">{container.barcode || '-'}</TableCell>
                <TableCell>{container.noCartons || 0}</TableCell>
                <TableCell>{container.gross || 0}</TableCell>
                <TableCell>{container.nett || 0}</TableCell>
                <TableCell>{container.commodityCode || '-'}</TableCell>
                <TableCell>{container.varietyCode || '-'}</TableCell>
                <TableCell>{container.gradeCode || '-'}</TableCell>
                <TableCell>{container.packCode || '-'}</TableCell>
                <TableCell>{container.countCode || '-'}</TableCell>
                <TableCell>{container.markCode || '-'}</TableCell>
                <TableCell>{container.targetMarket || '-'}</TableCell>
                <TableCell>{container.country || '-'}</TableCell>
                <TableCell>{container.farmNo || '-'}</TableCell>
                <TableCell>{container.phc || '-'}</TableCell>
                <TableCell>{container.orchard || '-'}</TableCell>
                <TableCell>{container.inspectionDate || '-'}</TableCell>
                <TableCell>{container.inspPoint || '-'}</TableCell>
                <TableCell>{container.inspCode || '-'}</TableCell>
                <TableCell>{container.originalIntakeDate || '-'}</TableCell>
                <TableCell>{container.consignmentNoteNo || '-'}</TableCell>
                <TableCell>{container.temptale || '-'}</TableCell>
                <TableCell>{container.inventoryCode || '-'}</TableCell>
                <TableCell>{container.phytoData || '-'}</TableCell>
                <TableCell>{container.upn || '-'}</TableCell>
                <TableCell className="font-mono">{container.consecNo || '-'}</TableCell>
                <TableCell>{container.targetCountry || '-'}</TableCell>
                <TableCell>{container.productionArea || '-'}</TableCell>
                <TableCell>{container.shipName || '-'}</TableCell>
                <TableCell className="font-mono">{container.voyageNo || '-'}</TableCell>
                <TableCell className="font-mono">{container.callSign || '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};
