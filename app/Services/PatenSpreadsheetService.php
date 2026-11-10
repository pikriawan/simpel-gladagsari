<?php

namespace App\Services;

use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Font;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet as PhpSheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

class PatenSpreadsheetService
{
    /**
     * Build an XLSX spreadsheet instance from Jspreadsheet data, styles, merges,
     * columns, and rows, supporting multiple worksheets or a single worksheet.
     */
    public function createSpreadsheet(
        array $data = [],
        ?array $styles = null,
        ?array $merges = null,
        ?array $sheets = null,
        ?array $columns = null,
        ?array $rows = null
    ): Spreadsheet {
        $spreadsheet = new Spreadsheet();

        if (!empty($sheets) && is_array($sheets)) {
            foreach ($sheets as $index => $sheetInfo) {
                $sheet = $index === 0 ? $spreadsheet->getActiveSheet() : $spreadsheet->createSheet();
                $title = !empty($sheetInfo['name']) ? $sheetInfo['name'] : ('Sheet' . ($index + 1));
                // Clean sheet name: max 31 chars and no illegal characters: \ / ? * : [ ]
                $cleanTitle = mb_substr(preg_replace('/[\\\\\/?*:\\[\\]]/', '', $title), 0, 31) ?: ('Sheet' . ($index + 1));
                $sheet->setTitle($cleanTitle);

                $this->populateSheet(
                    $sheet,
                    $sheetInfo['data'] ?? [],
                    $sheetInfo['style'] ?? null,
                    $sheetInfo['merge'] ?? null,
                    $sheetInfo['columns'] ?? null,
                    $sheetInfo['rows'] ?? null
                );
            }
        } else {
            $sheet = $spreadsheet->getActiveSheet();
            $sheet->setTitle('Sheet1');
            $this->populateSheet($sheet, $data, $styles, $merges, $columns, $rows);
        }

        $spreadsheet->setActiveSheetIndex(0);

        return $spreadsheet;
    }

    /**
     * Populate a single worksheet with data, merges, styles, column widths, and row heights.
     */
    public function populateSheet(
        PhpSheet $sheet,
        array $data,
        ?array $styles = null,
        ?array $merges = null,
        ?array $columns = null,
        ?array $rows = null
    ): void {
        // 1. Fill data
        foreach ($data as $rowIndex => $row) {
            if (!is_array($row)) {
                continue;
            }
            $rowNum = $rowIndex + 1;
            foreach ($row as $colIndex => $val) {
                if ($val !== null && $val !== '') {
                    $colLetter = Coordinate::stringFromColumnIndex($colIndex + 1);
                    $sheet->setCellValue("{$colLetter}{$rowNum}", $val);
                }
            }
        }

        // 2. Apply merges
        if (!empty($merges)) {
            foreach ($merges as $cell => $dimensions) {
                if (is_array($dimensions) && count($dimensions) >= 2) {
                    [$colspan, $rowspan] = $dimensions;
                    [$colLetter, $rowNum] = Coordinate::coordinateFromString($cell);
                    $startCol = Coordinate::columnIndexFromString($colLetter);
                    $endCol = $startCol + (int) $colspan - 1;
                    $endRow = (int) $rowNum + (int) $rowspan - 1;
                    $endColLetter = Coordinate::stringFromColumnIndex($endCol);
                    $range = "{$colLetter}{$rowNum}:{$endColLetter}{$endRow}";
                    $sheet->mergeCells($range);
                }
            }
        }

        // 3. Apply styles
        if (!empty($styles)) {
            foreach ($styles as $cell => $styleStr) {
                if (empty($styleStr) || !is_string($styleStr)) {
                    continue;
                }
                $this->applyCellStyle($sheet, $cell, $styleStr);
            }
        }

        // 4. Apply column widths (konversi pixel ke satuan lebar karakter Excel: ~7.5px per karakter)
        if (!empty($columns)) {
            foreach ($columns as $colIndex => $colDef) {
                $width = is_array($colDef) ? ($colDef['width'] ?? null) : $colDef;
                if ($width && is_numeric($width) && $width > 0) {
                    $colLetter = Coordinate::stringFromColumnIndex((int) $colIndex + 1);
                    $excelWidth = max(1, round((float) $width / 7.5, 2));
                    $sheet->getColumnDimension($colLetter)->setWidth($excelWidth);
                }
            }
        }

        // 5. Apply row heights (konversi pixel ke points Excel: 1 pt = 1.33 px => pt = px * 0.75)
        if (!empty($rows)) {
            foreach ($rows as $rowIndex => $rowDef) {
                $height = is_array($rowDef) ? ($rowDef['height'] ?? null) : $rowDef;
                if ($height && is_numeric($height) && $height > 0) {
                    $rowNum = is_numeric($rowIndex) ? ((int) $rowIndex + 1) : (int) $rowIndex;
                    $excelHeight = max(5, round((float) $height * 0.75, 2));
                    $sheet->getRowDimension($rowNum)->setRowHeight($excelHeight);
                }
            }
        }
    }

    /**
     * Generate XLSX file binary content.
     */
    public function generateXlsxBinary(
        array $data = [],
        ?array $styles = null,
        ?array $merges = null,
        ?array $sheets = null,
        ?array $columns = null,
        ?array $rows = null
    ): string {
        $spreadsheet = $this->createSpreadsheet($data, $styles, $merges, $sheets, $columns, $rows);
        $writer = new Xlsx($spreadsheet);

        ob_start();
        $writer->save('php://output');
        $binary = ob_get_clean();

        return $binary ?: '';
    }

    /**
     * Apply CSS declarations to a PhpSpreadsheet cell.
     */
    protected function applyCellStyle($sheet, string $cell, string $styleStr): void
    {
        try {
            $cellStyle = $sheet->getStyle($cell);
        } catch (\Throwable) {
            return;
        }

        $declarations = explode(';', $styleStr);

        foreach ($declarations as $decl) {
            $decl = trim($decl);
            if (empty($decl) || !str_contains($decl, ':')) {
                continue;
            }

            [$prop, $val] = explode(':', $decl, 2);
            $prop = trim(strtolower($prop));
            $val = trim($val);

            switch ($prop) {
                case 'font-weight':
                    if (str_contains($val, 'bold') || intval($val) >= 700) {
                        $cellStyle->getFont()->setBold(true);
                    }
                    break;

                case 'font-style':
                    if (str_contains($val, 'italic')) {
                        $cellStyle->getFont()->setItalic(true);
                    }
                    break;

                case 'text-decoration':
                    if (str_contains($val, 'underline')) {
                        $cellStyle->getFont()->setUnderline(true);
                    }
                    break;

                case 'text-align':
                    if ($val === 'center') {
                        $cellStyle->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                    } elseif ($val === 'right') {
                        $cellStyle->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
                    } elseif ($val === 'left') {
                        $cellStyle->getAlignment()->setHorizontal(Alignment::HORIZONTAL_LEFT);
                    } elseif ($val === 'justify') {
                        $cellStyle->getAlignment()->setHorizontal(Alignment::HORIZONTAL_JUSTIFY);
                    }
                    break;

                case 'vertical-align':
                    if ($val === 'middle') {
                        $cellStyle->getAlignment()->setVertical(Alignment::VERTICAL_CENTER);
                    } elseif ($val === 'top') {
                        $cellStyle->getAlignment()->setVertical(Alignment::VERTICAL_TOP);
                    } elseif ($val === 'bottom') {
                        $cellStyle->getAlignment()->setVertical(Alignment::VERTICAL_BOTTOM);
                    }
                    break;

                case 'background-color':
                    $argb = $this->colorToArgb($val);
                    if ($argb) {
                        $cellStyle->getFill()
                            ->setFillType(Fill::FILL_SOLID)
                            ->getStartColor()
                            ->setARGB($argb);
                    }
                    break;

                case 'color':
                    $argb = $this->colorToArgb($val);
                    if ($argb) {
                        $cellStyle->getFont()->getColor()->setARGB($argb);
                    }
                    break;

                case 'border-top':
                case 'border-bottom':
                case 'border-left':
                case 'border-right':
                    $this->applyBorderProperty($cellStyle, $prop, $val);
                    break;
            }
        }
    }

    protected function applyBorderProperty($cellStyle, string $prop, string $val): void
    {
        $borderObj = match ($prop) {
            'border-top' => $cellStyle->getBorders()->getTop(),
            'border-bottom' => $cellStyle->getBorders()->getBottom(),
            'border-left' => $cellStyle->getBorders()->getLeft(),
            'border-right' => $cellStyle->getBorders()->getRight(),
            default => null,
        };

        if (!$borderObj) {
            return;
        }

        if (empty($val) || $val === 'none') {
            $borderObj->setBorderStyle(Border::BORDER_NONE);
            return;
        }

        $lineStyle = Border::BORDER_THIN;
        if (str_contains($val, 'double')) {
            $lineStyle = Border::BORDER_DOUBLE;
        } elseif (str_contains($val, 'dashed')) {
            $lineStyle = Border::BORDER_DASHED;
        } elseif (str_contains($val, 'dotted')) {
            $lineStyle = Border::BORDER_DOTTED;
        } elseif (preg_match('/(\d+)px/', $val, $m)) {
            $px = (int) $m[1];
            if ($px >= 3) {
                $lineStyle = Border::BORDER_THICK;
            } elseif ($px === 2) {
                $lineStyle = Border::BORDER_MEDIUM;
            }
        }

        $borderObj->setBorderStyle($lineStyle);

        // Parse color if present
        if (preg_match('/(#(?:[0-9a-fA-F]{3}){1,2}|rgb\([^)]+\)|black|red|blue|gray|grey)/i', $val, $colorMatch)) {
            $argb = $this->colorToArgb($colorMatch[1]);
            if ($argb) {
                $borderObj->getColor()->setARGB($argb);
            }
        }
    }

    protected function colorToArgb(string $color): ?string
    {
        $color = trim(strtolower($color));
        if ($color === 'black') return 'FF000000';
        if ($color === 'white') return 'FFFFFFFF';
        if ($color === 'red') return 'FFFF0000';
        if ($color === 'blue') return 'FF0000FF';
        if ($color === 'gray' || $color === 'grey') return 'FF808080';

        if (str_starts_with($color, '#')) {
            $hex = ltrim($color, '#');
            if (strlen($hex) === 3) {
                $hex = $hex[0].$hex[0].$hex[1].$hex[1].$hex[2].$hex[2];
            }
            if (strlen($hex) === 6) {
                return 'FF' . strtoupper($hex);
            }
            if (strlen($hex) === 8) {
                return strtoupper($hex);
            }
        }

        if (preg_match('/rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/', $color, $m)) {
            return sprintf('FF%02X%02X%02X', $m[1], $m[2], $m[3]);
        }

        return null;
    }

    /**
     * Parse an existing XLSX or XLS file and extract all worksheets,
     * cell values, styles, merges, column dimensions, and row heights.
     */
    public function parseXlsxFile(string $filePath): array
    {
        @set_time_limit(180);

        $reader = IOFactory::createReaderForFile($filePath);
        $reader->setReadDataOnly(false);
        $spreadsheet = $reader->load($filePath);

        $sheets = [];

        foreach ($spreadsheet->getAllSheets() as $sheet) {
            $title = $sheet->getTitle();

            // 1. Ambil data dengan sangat cepat via toArray() (kurang dari 5ms)
            $rawArray = $sheet->toArray('', true, false, false);
            $maxCols = 0;
            foreach ($rawArray as $row) {
                if (is_array($row)) {
                    $maxCols = max($maxCols, count($row));
                }
            }

            // Normalisasi agar ada minimal 25 baris dan 15 kolom untuk tampilan yang leluasa
            $targetCols = max($maxCols, 15);
            $targetRows = max(count($rawArray), 25);

            $data = [];
            for ($r = 0; $r < $targetRows; $r++) {
                $row = $rawArray[$r] ?? [];
                $paddedRow = [];
                for ($c = 0; $c < $targetCols; $c++) {
                    $val = $row[$c] ?? '';
                    $paddedRow[] = ($val !== null && $val !== '') ? (string) $val : '';
                }
                $data[] = $paddedRow;
            }

            // 2. Merges
            $merges = [];
            foreach ($sheet->getMergeCells() as $range) {
                if (str_contains($range, ':')) {
                    [$start, $end] = explode(':', $range);
                    [$startColLetter, $startRow] = Coordinate::coordinateFromString($start);
                    [$endColLetter, $endRow] = Coordinate::coordinateFromString($end);
                    $startColIdx = Coordinate::columnIndexFromString($startColLetter);
                    $endColIdx = Coordinate::columnIndexFromString($endColLetter);
                    $colspan = $endColIdx - $startColIdx + 1;
                    $rowspan = (int) $endRow - (int) $startRow + 1;
                    $merges[$start] = [$colspan, $rowspan];
                }
            }

            // 3. Styles - HANYA iterasi sel yang benar-benar ada data/formatnya via getCellCollection()
            // Ini mencegah loop 50.000+ sel kosong yang memicu timeout 30 detik
            $styles = [];
            $coordinates = $sheet->getCellCollection()->getCoordinates();
            foreach ($coordinates as $cellCoord) {
                $cellStyle = $sheet->getStyle($cellCoord);

                $css = [];

                // Font
                $font = $cellStyle->getFont();
                if ($font->getBold()) {
                    $css[] = 'font-weight: bold';
                }
                if ($font->getItalic()) {
                    $css[] = 'font-style: italic';
                }
                if ($font->getUnderline() && $font->getUnderline() !== Font::UNDERLINE_NONE) {
                    $css[] = 'text-decoration: underline';
                }
                $fontColor = $font->getColor()->getARGB();
                if ($fontColor && strlen($fontColor) === 8 && $fontColor !== 'FF000000') {
                    $css[] = 'color: #' . substr($fontColor, 2);
                }

                // Background color
                $fill = $cellStyle->getFill();
                $bgColor = $fill->getStartColor()->getARGB();
                if ($bgColor && strlen($bgColor) === 8 && $bgColor !== 'FFFFFFFF' && $bgColor !== '00000000') {
                    $css[] = 'background-color: #' . substr($bgColor, 2);
                }

                // Alignment
                $align = $cellStyle->getAlignment();
                $hAlign = $align->getHorizontal();
                if ($hAlign === Alignment::HORIZONTAL_CENTER) {
                    $css[] = 'text-align: center';
                } elseif ($hAlign === Alignment::HORIZONTAL_RIGHT) {
                    $css[] = 'text-align: right';
                } elseif ($hAlign === Alignment::HORIZONTAL_LEFT) {
                    $css[] = 'text-align: left';
                }

                // Borders
                $borders = $cellStyle->getBorders();
                $borderSides = [
                    'top' => 'border-top',
                    'bottom' => 'border-bottom',
                    'left' => 'border-left',
                    'right' => 'border-right',
                ];
                foreach ($borderSides as $side => $cssProp) {
                    $b = match ($side) {
                        'top' => $borders->getTop(),
                        'bottom' => $borders->getBottom(),
                        'left' => $borders->getLeft(),
                        'right' => $borders->getRight(),
                    };
                    $bStyle = $b->getBorderStyle();
                    if ($bStyle && $bStyle !== Border::BORDER_NONE) {
                        $thick = match ($bStyle) {
                            Border::BORDER_THICK => '3px',
                            Border::BORDER_MEDIUM => '2px',
                            default => '1px',
                        };
                        $line = match ($bStyle) {
                            Border::BORDER_DOUBLE => 'double',
                            Border::BORDER_DASHED => 'dashed',
                            Border::BORDER_DOTTED => 'dotted',
                            default => 'solid',
                        };
                        $bColor = $b->getColor()->getARGB();
                        $colorHex = ($bColor && strlen($bColor) === 8) ? ('#' . substr($bColor, 2)) : 'black';
                        $css[] = "{$cssProp}: {$thick} {$line} {$colorHex}";
                    }
                }

                if (!empty($css)) {
                    $styles[$cellCoord] = implode('; ', $css) . ';';
                }
            }

            // 4. Column dimensions
            $columns = [];
            foreach ($sheet->getColumnDimensions() as $colLetter => $dim) {
                $colWidth = $dim->getWidth();
                if ($colWidth > 0) {
                    $colIndex = Coordinate::columnIndexFromString($colLetter) - 1;
                    $columns[$colIndex] = [
                        'width' => (int) round($colWidth * 7.5),
                    ];
                }
            }
            ksort($columns);
            $normalizedColumns = [];
            $maxColIdx = !empty($columns) ? max(array_keys($columns)) : -1;
            for ($c = 0; $c <= max($maxColIdx, $targetCols - 1); $c++) {
                $normalizedColumns[$c] = $columns[$c] ?? ['width' => 100];
            }

            // 5. Row dimensions
            $rows = [];
            foreach ($sheet->getRowDimensions() as $rNum => $dim) {
                $rHeight = $dim->getRowHeight();
                if ($rHeight > 0) {
                    $rIdx = (int) $rNum - 1;
                    $rows[$rIdx] = [
                        'height' => (int) round($rHeight / 0.75),
                    ];
                }
            }

            $sheets[] = [
                'name' => $title,
                'data' => $data,
                'style' => !empty($styles) ? $styles : null,
                'merge' => !empty($merges) ? $merges : null,
                'columns' => $normalizedColumns,
                'rows' => !empty($rows) ? $rows : null,
            ];
        }

        return $sheets;
    }
}
