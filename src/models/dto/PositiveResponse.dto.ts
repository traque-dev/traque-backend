export class PositiveResponseDto {
  public result = 'OK';

  static instance() {
    return new PositiveResponseDto();
  }
}
