export type VisualCommandCategory = 'diagram-data' | 'technical-structure' | 'notes-presentation';
export type VisualCommandSource = '500-perintah' | 'kumpulan-command';

export interface VisualCommand {
	value: string;
	label: string;
	description: string;
	category: VisualCommandCategory;
	source: VisualCommandSource;
}

export const VISUAL_COMMANDS: readonly VisualCommand[] = [
	{
		value: '/infographic',
		label: 'Infographic',
		description: 'Tata letak infografis',
		category: 'diagram-data',
		source: '500-perintah'
	},
	{
		value: '/scientificdiagram',
		label: 'Scientific Diagram',
		description:
			'Memvisualisasikan mekanisme atau fenomena ilmiah menjadi diagram yang informatif dan mudah dipahami.',
		category: 'diagram-data',
		source: 'kumpulan-command'
	},
	{
		value: '/diagram',
		label: 'Diagram',
		description: 'Menggambar diagram konsep',
		category: 'diagram-data',
		source: '500-perintah'
	},
	{
		value: '/schematic',
		label: 'Schematic',
		description: 'Skema teknis sederhana',
		category: 'diagram-data',
		source: '500-perintah'
	},
	{
		value: '/flowchart',
		label: 'Flowchart',
		description: 'Bagan alur langkah demi langkah',
		category: 'diagram-data',
		source: '500-perintah'
	},
	{
		value: '/process',
		label: 'Process',
		description: 'Menjelaskan proses lengkap',
		category: 'diagram-data',
		source: '500-perintah'
	},
	{
		value: '/comparison',
		label: 'Comparison',
		description: 'Perbandingan berdampingan (side-by-side)',
		category: 'diagram-data',
		source: '500-perintah'
	},
	{
		value: '/timeline',
		label: 'Timeline',
		description: 'Lini masa kronologis',
		category: 'diagram-data',
		source: '500-perintah'
	},
	{
		value: '/conceptmap',
		label: 'Concept Map',
		description:
			'Memvisualisasikan hubungan antara berbagai konsep secara hierarkis dan saling terhubung.',
		category: 'diagram-data',
		source: 'kumpulan-command'
	},
	{
		value: '/anatomy',
		label: 'Anatomy',
		description: 'Menjelaskan seluruh bagian/struktur',
		category: 'technical-structure',
		source: '500-perintah'
	},
	{
		value: '/blueprint',
		label: 'Blueprint',
		description: 'Cetak biru teknis (technical blueprint)',
		category: 'technical-structure',
		source: '500-perintah'
	},
	{
		value: '/isometric',
		label: 'Isometric',
		description: 'Ilustrasi isometrik 3D',
		category: 'technical-structure',
		source: '500-perintah'
	},
	{
		value: '/explodedview',
		label: 'Exploded View',
		description: 'Membongkar objek menjadi komponen-komponennya',
		category: 'technical-structure',
		source: '500-perintah'
	},
	{
		value: '/cutaway',
		label: 'Cutaway',
		description: 'Ilustrasi potongan melintang (cutaway)',
		category: 'technical-structure',
		source: '500-perintah'
	},
	{
		value: '/crosssection',
		label: 'Cross Section',
		description: 'Ilustrasi irisan melintang',
		category: 'technical-structure',
		source: '500-perintah'
	},
	{
		value: '/layers',
		label: 'Layers',
		description: 'Arsitektur lapis demi lapis',
		category: 'technical-structure',
		source: '500-perintah'
	},
	{
		value: '/scale',
		label: 'Scale',
		description: 'Membandingkan ukuran secara visual',
		category: 'technical-structure',
		source: '500-perintah'
	},
	{
		value: '/handwrittennotes',
		label: 'Handwritten Notes',
		description:
			'Mengubah materi menjadi catatan belajar bergaya tulisan tangan dengan anotasi, garis, panah, dan highlight.',
		category: 'notes-presentation',
		source: 'kumpulan-command'
	}
] as const;

export const VISUAL_COMMAND_CATEGORY_LABELS: Record<VisualCommandCategory, string> = {
	'diagram-data': 'Diagram & Data',
	'technical-structure': 'Struktur Teknis',
	'notes-presentation': 'Catatan & Presentasi'
};

export const DEFAULT_VISUAL_COMMAND = '/infographic';
export const VISUAL_COMMAND_VALUES = VISUAL_COMMANDS.map((command) => command.value);

export function findVisualCommand(value: string): VisualCommand | undefined {
	return VISUAL_COMMANDS.find((command) => command.value === value);
}

export function isVisualCommand(value: string): boolean {
	return VISUAL_COMMANDS.some((command) => command.value === value);
}
