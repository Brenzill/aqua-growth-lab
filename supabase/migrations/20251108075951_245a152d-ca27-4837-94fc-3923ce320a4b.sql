-- Create validation history table
CREATE TABLE IF NOT EXISTS public.validation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  total_records INTEGER DEFAULT 0,
  successful_records INTEGER DEFAULT 0,
  error_records INTEGER DEFAULT 0,
  total_containers INTEGER DEFAULT 0,
  total_pallets INTEGER DEFAULT 0,
  total_cartons INTEGER DEFAULT 0,
  validation_errors JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create container details table with all fields
CREATE TABLE IF NOT EXISTS public.container_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  validation_id UUID REFERENCES public.validation_history(id) ON DELETE CASCADE,
  season TEXT,
  location_code TEXT,
  organization TEXT,
  stuff_date TEXT,
  container_no TEXT NOT NULL,
  seal_number TEXT,
  barcode TEXT,
  no_cartons INTEGER,
  gross DECIMAL,
  nett DECIMAL,
  commodity_code TEXT,
  variety_code TEXT,
  grade_code TEXT,
  pack_code TEXT,
  count_code TEXT,
  mark_code TEXT,
  target_market TEXT,
  country TEXT,
  farm_no TEXT,
  phc TEXT,
  orchard TEXT,
  inspection_date TEXT,
  insp_point TEXT,
  insp_code TEXT,
  original_intake_date TEXT,
  consignment_note_no TEXT,
  temptale TEXT,
  inventory_code TEXT,
  phyto_data TEXT,
  upn TEXT,
  consec_no TEXT,
  target_country TEXT,
  production_area TEXT,
  ship_name TEXT,
  voyage_no TEXT,
  call_sign TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.validation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.container_details ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (modify as needed for authentication)
CREATE POLICY "Allow public read access to validation_history"
  ON public.validation_history
  FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert to validation_history"
  ON public.validation_history
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public read access to container_details"
  ON public.container_details
  FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert to container_details"
  ON public.container_details
  FOR INSERT
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_validation_history_created_at ON public.validation_history(created_at DESC);
CREATE INDEX idx_container_details_validation_id ON public.container_details(validation_id);
CREATE INDEX idx_container_details_container_no ON public.container_details(container_no);