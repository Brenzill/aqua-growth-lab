import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileUploader } from '@/components/FileUploader';
import { EDIStats } from '@/components/EDIStats';
import { ContainerTable } from '@/components/ContainerTable';
import { FileLogCard } from '@/components/FileLogCard';
import { TextConverter } from '@/components/TextConverter';
import { Dashboard } from '@/components/Dashboard';
import { EDIParser } from '@/utils/ediParser';
import { ContainerSeal, EDIFileLog } from '@/types/edi';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { FileCode, Waves, FileSpreadsheet, ArrowRight, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import * as XLSX from 'xlsx';

const Index = () => {
  const [fileLog, setFileLog] = useState<Partial<EDIFileLog> | null>(null);
  const [containers, setContainers] = useState<ContainerSeal[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [fileName, setFileName] = useState('');
  const [rawFileContent, setRawFileContent] = useState<string | null>(null);
  const [isTextFile, setIsTextFile] = useState(false);

  const handleFileUpload = async (content: string, name: string) => {
    setRawFileContent(content);
    setFileName(name);

    // Check if it's a text/CSV file for conversion
    const fileExtension = name.split('.').pop()?.toLowerCase();
    if (fileExtension === 'txt' || fileExtension === 'csv') {
      setIsTextFile(true);
      setFileLog(null);
      setContainers([]);
      setTotalRecords(0);
      toast.success('Text file loaded!', {
        description: 'Ready to convert to Excel or CSV format',
      });
      return;
    }

    // Process as EDI file
    setIsTextFile(false);
    try {
      const parser = new EDIParser();
      const result = parser.parseFile(content);

      const log = {
        ...result.fileLog,
        fileName: name,
        status: 'completed' as const,
        createdAt: new Date().toISOString(),
        id: Date.now().toString(),
      };

      setFileLog(log);
      setContainers(result.containers);
      setTotalRecords(result.records.length);

      // Save to database
      await saveToDatabase(name, result.containers, result.records.length, log);

      toast.success('File processed successfully!', {
        description: `Processed ${result.records.length} records and found ${result.containers.length} containers.`,
      });
    } catch (error) {
      toast.error('Error processing file', {
        description: 'Please check the file format and try again.',
      });
      console.error('Parse error:', error);
    }
  };

  const saveToDatabase = async (
    fileName: string,
    containers: ContainerSeal[],
    totalRecords: number,
    log: Partial<EDIFileLog>
  ) => {
    try {
      // Insert validation history
      const { data: validation, error: validationError } = await supabase
        .from('validation_history')
        .insert({
          file_name: fileName,
          file_type: 'EDI',
          total_records: totalRecords,
          successful_records: totalRecords,
          error_records: 0,
          total_containers: containers.length,
          total_pallets: log.totalPalletCount || 0,
          total_cartons: log.totalCartonCount || 0,
        })
        .select()
        .single();

      if (validationError) throw validationError;

      // Insert container details
      if (validation && containers.length > 0) {
        const containerRecords = containers.map((container) => ({
          validation_id: validation.id,
          season: container.season,
          location_code: container.locationCode,
          organization: container.organization,
          stuff_date: container.stuffDate,
          container_no: container.containerNo,
          seal_number: container.sealNumber,
          barcode: container.barcode,
          no_cartons: container.noCartons,
          gross: container.gross,
          nett: container.nett,
          commodity_code: container.commodityCode,
          variety_code: container.varietyCode,
          grade_code: container.gradeCode,
          pack_code: container.packCode,
          count_code: container.countCode,
          mark_code: container.markCode,
          target_market: container.targetMarket,
          country: container.country,
          farm_no: container.farmNo,
          phc: container.phc,
          orchard: container.orchard,
          inspection_date: container.inspectionDate,
          insp_point: container.inspPoint,
          insp_code: container.inspCode,
          original_intake_date: container.originalIntakeDate,
          consignment_note_no: container.consignmentNoteNo,
          temptale: container.temptale,
          inventory_code: container.inventoryCode,
          phyto_data: container.phytoData,
          upn: container.upn,
          consec_no: container.consecNo,
          target_country: container.targetCountry,
          production_area: container.productionArea,
          ship_name: container.shipName,
          voyage_no: container.voyageNo,
          call_sign: container.callSign,
        }));

        const { error: containersError } = await supabase
          .from('container_details')
          .insert(containerRecords);

        if (containersError) throw containersError;
      }
    } catch (error) {
      console.error('Error saving to database:', error);
    }
  };

  const handleConvertToExcel = () => {
    if (!containers.length) {
      toast.error('No data to export', {
        description: 'Please upload and process an EDI file first.',
      });
      return;
    }

    try {
      toast.loading('Generating Excel file...', { id: 'excel-gen' });

      // Prepare container data for Excel
      const containerData = containers.map((container, index) => ({
        'No.': index + 1,
        'Container Number': container.containerNo,
        'Seal Number': container.sealNumber,
        'Ship Name': container.shipName,
        'Voyage Number': container.voyageNo,
        'Call Sign': container.callSign,
        'Stuff Date': container.stuffDate,
        'Consecutive Number': container.consecNo,
      }));

      // Prepare summary data
      const summaryData = [
        { 'Field': 'File Name', 'Value': fileName },
        { 'Field': 'Total Containers', 'Value': containers.length },
        { 'Field': 'Total Records', 'Value': totalRecords },
        { 'Field': 'Total Pallets', 'Value': fileLog?.totalPalletCount || 0 },
        { 'Field': 'Total Cartons', 'Value': fileLog?.totalCartonCount || 0 },
        { 'Field': 'Batch Number', 'Value': fileLog?.batchNumber || 'N/A' },
        { 'Field': 'Date Processed', 'Value': new Date().toLocaleString() },
      ];

      // Create workbook and worksheets
      const wb = XLSX.utils.book_new();
      
      // Add Summary sheet
      const wsSummary = XLSX.utils.json_to_sheet(summaryData);
      wsSummary['!cols'] = [{ wch: 20 }, { wch: 30 }];
      XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');
      
      // Add Containers sheet
      const wsContainers = XLSX.utils.json_to_sheet(containerData);
      wsContainers['!cols'] = [
        { wch: 5 }, { wch: 18 }, { wch: 15 }, { wch: 20 }, 
        { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 18 }
      ];
      XLSX.utils.book_append_sheet(wb, wsContainers, 'Containers');

      // Generate and download file
      const timestamp = new Date().toISOString().split('T')[0];
      const excelFileName = `PalletOut_${fileName.replace(/\.[^/.]+$/, '')}_${timestamp}.xlsx`;
      XLSX.writeFile(wb, excelFileName);

      toast.success('Excel file generated!', {
        id: 'excel-gen',
        description: `Downloaded: ${excelFileName}`,
      });
    } catch (error) {
      toast.error('Error generating Excel file', {
        id: 'excel-gen',
        description: 'Please try again.',
      });
      console.error('Excel generation error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-primary to-accent rounded-lg">
              <Waves className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                EDI Import System
              </h1>
              <p className="text-muted-foreground">Pallet Out File Processing</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Dashboard */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <FileCode className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Dashboard</h2>
          </div>
          <Dashboard />
        </section>

        {/* Quick Actions */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <FileCode className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2">EDI File Import</h3>
                <p className="text-muted-foreground">
                  Process pallet out EDI files and extract container information
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow border-2 border-secondary/20">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-secondary/10 rounded-lg">
                <FileSpreadsheet className="h-8 w-8 text-secondary" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2">CSV/Excel Validation</h3>
                <p className="text-muted-foreground mb-4">
                  Upload and validate shipping data with comprehensive error checking
                </p>
                <Button asChild variant="default" className="gap-2">
                  <Link to="/import">
                    Go to Validator
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow border-2 border-accent/20">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-accent/10 rounded-lg">
                <Download className="h-8 w-8 text-accent" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2">PO to Excel Converter</h3>
                <p className="text-muted-foreground mb-4">
                  Convert processed EDI files to Excel format for easy sharing
                </p>
                <Button 
                  variant="default"
                  size="lg"
                  className="gap-2"
                  onClick={handleConvertToExcel}
                  disabled={!containers.length}
                >
                  <Download className="h-4 w-4" />
                  {containers.length ? 'Convert to Excel' : 'No Data to Convert'}
                </Button>
              </div>
            </div>
          </Card>
        </section>

        {/* File Upload Section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <FileCode className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Upload EDI File</h2>
          </div>
          <FileUploader onFileUpload={handleFileUpload} />
        </section>

        {/* Text File Converter */}
        {isTextFile && rawFileContent && (
          <section>
            <TextConverter content={rawFileContent} fileName={fileName} />
          </section>
        )}

        {/* Results Section */}
        {fileLog && (
          <>
            {/* Stats */}
            <section>
              <h2 className="text-xl font-semibold mb-4">Overview</h2>
              <EDIStats
                totalRecords={totalRecords}
                containerCount={containers.length}
                palletCount={fileLog.totalPalletCount || 0}
                cartonCount={fileLog.totalCartonCount || 0}
              />
            </section>

            {/* File Log Details */}
            <section>
              <FileLogCard fileLog={fileLog} />
            </section>

            {/* Container Table */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Container Details</h2>
                <Button 
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={handleConvertToExcel}
                >
                  <Download className="h-4 w-4" />
                  Export to Excel
                </Button>
              </div>
              <ContainerTable containers={containers} />
            </section>
          </>
        )}

        {/* Empty State */}
        {!fileLog && !isTextFile && (
          <section className="text-center py-16">
            <div className="inline-flex p-6 bg-muted rounded-full mb-4">
              <FileCode className="h-16 w-16 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-semibold mb-2">No File Loaded</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Upload an EDI file to start processing pallet out files, containers, and shipping information.
            </p>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t mt-16 py-8 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>EDI Import System - Processing pallet out files efficiently</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
