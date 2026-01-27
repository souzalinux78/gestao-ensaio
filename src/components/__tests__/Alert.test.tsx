import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Alert from '../Alert';

describe('Alert', () => {
  it('deve renderizar mensagem de sucesso', () => {
    render(<Alert tipo="sucesso" texto="Operação realizada!" />);
    
    expect(screen.getByText('Operação realizada!')).toBeInTheDocument();
    expect(screen.getByText('✓')).toBeInTheDocument();
  });
  
  it('deve renderizar mensagem de erro', () => {
    render(<Alert tipo="erro" texto="Erro ao processar" />);
    
    expect(screen.getByText('Erro ao processar')).toBeInTheDocument();
    expect(screen.getByText('✕')).toBeInTheDocument();
  });
  
  it('deve renderizar mensagem de aviso', () => {
    render(<Alert tipo="aviso" texto="Atenção necessária" />);
    
    expect(screen.getByText('Atenção necessária')).toBeInTheDocument();
    expect(screen.getByText('⚠')).toBeInTheDocument();
  });
  
  it('deve renderizar mensagem de info', () => {
    render(<Alert tipo="info" texto="Informação importante" />);
    
    expect(screen.getByText('Informação importante')).toBeInTheDocument();
    expect(screen.getByText('ℹ')).toBeInTheDocument();
  });
  
  it('deve chamar onClose quando botão de fechar é clicado', async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();
    
    render(<Alert tipo="info" texto="Mensagem" onClose={onClose} />);
    
    const closeButton = screen.getByLabelText('Fechar');
    await user.click(closeButton);
    
    expect(onClose).toHaveBeenCalledTimes(1);
  });
  
  it('não deve mostrar botão de fechar quando onClose não é fornecido', () => {
    render(<Alert tipo="sucesso" texto="Mensagem" />);
    
    expect(screen.queryByLabelText('Fechar')).not.toBeInTheDocument();
  });
});
