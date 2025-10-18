import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductBulkUploadPage } from './product-bulk-upload.page';

describe('ProductBulkUploadPage', () => {
  let component: ProductBulkUploadPage;
  let fixture: ComponentFixture<ProductBulkUploadPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductBulkUploadPage],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductBulkUploadPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set selected file when file is chosen', () => {
    const file = new File(['test'], 'test.csv', { type: 'text/csv' });
    const event = {
      target: {
        files: [file],
      },
    } as unknown as Event;

    component.onFileSelected(event);

    expect(component.selectedFile).toBe(file);
    expect(component.fileName).toBe('test.csv');
  });

  it('should not set selected file when no file is chosen', () => {
    const event = {
      target: {
        files: [],
      },
    } as unknown as Event;

    component.onFileSelected(event);

    expect(component.selectedFile).toBeNull();
    expect(component.fileName).toBe('');
  });

  it('should log file name when processing file', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    const file = new File(['test'], 'test.csv', { type: 'text/csv' });
    component.selectedFile = file;
    component.fileName = 'test.csv';

    component.onProcessFile();

    expect(consoleSpy).toHaveBeenCalledWith('Processing file:', 'test.csv');
    consoleSpy.mockRestore();
  });

  it('should not process when no file is selected', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    component.selectedFile = null;

    component.onProcessFile();

    expect(consoleSpy).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
